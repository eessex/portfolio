import { cacheLife } from 'next/cache'

import { fetchVersionStatus } from './latest-release'

jest.mock('../../../package.json', () => ({ version: '1.2.3' }))

const release = (tag: string, body = '') => ({
  tag_name: tag,
  html_url: `https://github.com/x/y/releases/tag/${tag}`,
  body
})
const respond = (...releases: ReturnType<typeof release>[]) =>
  fetchMock.mockResponseOnce(JSON.stringify(releases))

describe('fetchVersionStatus', () => {
  beforeEach(() => {
    fetchMock.resetMocks()
    jest.mocked(cacheLife).mockClear()
    delete process.env.GITHUB_TOKEN
  })

  it('reports an available update', async () => {
    respond(release('v1.3.0'), release('v1.2.3'))
    expect(await fetchVersionStatus()).toMatchObject({
      current: '1.2.3',
      latest: '1.3.0',
      isUpdateAvailable: true,
      actionNeeded: undefined
    })
  })

  it('keeps a major’s Action needed after later patches', async () => {
    respond(
      release('v2.0.1', 'fix'),
      release('v2.0.0', '## Action needed\n\nSet FOO.\n\n## Other'),
      release('v1.2.3')
    )
    const status = await fetchVersionStatus()
    expect(status.latest).toBe('2.0.1')
    expect(status.actionNeeded).toBe('Set FOO.')
  })

  it('joins the notes of every release in the gap', async () => {
    respond(
      release('v3.0.0', '## Action needed\nB'),
      release('v2.0.0', '## Action needed\nA')
    )
    expect((await fetchVersionStatus()).actionNeeded).toBe('A\n\nB')
  })

  it('ignores releases at or below the installed version', async () => {
    respond(
      release('v1.2.3', '## Action needed\nold'),
      release('v1.0.0')
    )
    const status = await fetchVersionStatus()
    expect(status.isUpdateAvailable).toBe(false)
    expect(status.actionNeeded).toBeUndefined()
  })

  it('keeps nested headings in a release’s notes', async () => {
    respond(
      release(
        'v2.0.0',
        '## Action needed\n\nIntro\n\n### Steps\nRun.\n\n## Other'
      )
    )
    expect((await fetchVersionStatus()).actionNeeded).toBe(
      'Intro\n\n### Steps\nRun.'
    )
  })

  it('follows pages until it reaches the installed version', async () => {
    const full = Array.from({ length: 100 }, (_, i) =>
      release(`v3.${99 - i}.0`)
    )
    fetchMock.mockResponseOnce(JSON.stringify(full))
    respond(
      release('v2.0.0', '## Action needed\nA'),
      release('v1.2.3')
    )
    const status = await fetchVersionStatus()
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(fetchMock.mock.calls[1][0]).toContain('page=2')
    expect(status.latest).toBe('3.99.0')
    expect(status.actionNeeded).toBe('A')
  })

  it('reports a truncated history when the page bound is hit', async () => {
    for (let i = 0; i < 10; i++) {
      fetchMock.mockResponseOnce(
        JSON.stringify(
          Array.from({ length: 100 }, (_, n) =>
            release(`v9.${i}.${n}`)
          )
        )
      )
    }
    const status = await fetchVersionStatus()
    expect(status.isUpdateAvailable).toBe(true)
    expect(status.isHistoryTruncated).toBe(true)
    expect(status.latest).toBe('9.9.99')
    expect(fetchMock).toHaveBeenCalledTimes(10)
  })

  it('is not truncated when the last page reaches the installed version', async () => {
    for (let i = 0; i < 9; i++) {
      fetchMock.mockResponseOnce(
        JSON.stringify(
          Array.from({ length: 100 }, (_, n) =>
            release(`v9.${i}.${n}`)
          )
        )
      )
    }
    fetchMock.mockResponseOnce(
      JSON.stringify([
        ...Array.from({ length: 99 }, (_, n) => release(`v8.0.${n}`)),
        release('v1.2.3')
      ])
    )
    const status = await fetchVersionStatus()
    expect(status.isHistoryTruncated).toBe(false)
    expect(fetchMock).toHaveBeenCalledTimes(10)
  })

  it('does not treat a GitHub error as a status', async () => {
    fetchMock.mockResponseOnce('rate limited', { status: 403 })
    expect(await fetchVersionStatus()).toEqual({
      current: '1.2.3',
      isUpdateAvailable: false
    })
  })

  it('caches a failure for minutes, not hours', async () => {
    fetchMock.mockResponseOnce('rate limited', { status: 403 })
    await fetchVersionStatus()
    expect(cacheLife).toHaveBeenCalledTimes(1)
    expect(cacheLife).toHaveBeenCalledWith('minutes')
  })

  it('caches a success for hours', async () => {
    respond(release('v1.2.3'))
    await fetchVersionStatus()
    expect(cacheLife).toHaveBeenCalledTimes(1)
    expect(cacheLife).toHaveBeenCalledWith('hours')
  })

  it('authenticates when GITHUB_TOKEN is set', async () => {
    process.env.GITHUB_TOKEN = 'abc'
    respond(release('v1.2.3'))
    await fetchVersionStatus()
    const init = fetchMock.mock.calls[0][1] as RequestInit
    expect(init.headers).toMatchObject({
      Authorization: 'Bearer abc'
    })
  })

  it('sorts releases oldest first regardless of API order', async () => {
    respond(
      release('v2.0.0', '## Action needed\nA'),
      release('v3.0.0', '## Action needed\nB'),
      release('v2.5.0', '## Action needed\nC'),
      release('v1.2.3')
    )
    const status = await fetchVersionStatus()
    expect(status.latest).toBe('3.0.0')
    expect(status.actionNeeded).toBe('A\n\nC\n\nB')
  })

  it('fails to no latest known', async () => {
    fetchMock.mockRejectOnce(new Error('offline'))
    expect(await fetchVersionStatus()).toEqual({
      current: '1.2.3',
      isUpdateAvailable: false
    })
  })
})
