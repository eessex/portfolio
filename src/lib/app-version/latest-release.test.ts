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
  beforeEach(() => fetchMock.resetMocks())

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

  it('does not treat a GitHub error as a status', async () => {
    fetchMock.mockResponseOnce('rate limited', { status: 403 })
    expect(await fetchVersionStatus()).toEqual({
      current: '1.2.3',
      isUpdateAvailable: false
    })
  })

  it('fails to no latest known', async () => {
    fetchMock.mockRejectOnce(new Error('offline'))
    expect(await fetchVersionStatus()).toEqual({
      current: '1.2.3',
      isUpdateAvailable: false
    })
  })
})
