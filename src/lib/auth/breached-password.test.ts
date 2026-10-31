import { createHash } from 'node:crypto'

import fetchMock from 'jest-fetch-mock'

import { isPasswordBreached } from '@/lib/auth/breached-password'

const password = 'correct horse battery staple'
const hash = createHash('sha1')
  .update(password)
  .digest('hex')
  .toUpperCase()

describe('#isPasswordBreached', () => {
  beforeEach(() => {
    fetchMock.resetMocks()
  })

  it('sends only the hash prefix, with padding', async () => {
    fetchMock.mockResponseOnce('')

    await isPasswordBreached(password)

    const [url, init] = fetchMock.mock.calls[0] ?? []
    expect(url).toBe(
      `https://api.pwnedpasswords.com/range/${hash.slice(0, 5)}`
    )
    expect(init?.headers).toEqual({ 'Add-Padding': 'true' })
  })

  it('is true when the suffix is listed', async () => {
    fetchMock.mockResponseOnce(
      `0000000000000000000000000000000000A:1\r\n${hash.slice(5)}:42\r\n`
    )

    expect(await isPasswordBreached(password)).toBe(true)
  })

  it('ignores a padding entry with a count of 0', async () => {
    fetchMock.mockResponseOnce(`${hash.slice(5)}:0\r\n`)

    expect(await isPasswordBreached(password)).toBe(false)
  })

  it('is false when the suffix is absent', async () => {
    fetchMock.mockResponseOnce(
      '0000000000000000000000000000000000A:3'
    )

    expect(await isPasswordBreached(password)).toBe(false)
  })

  it('fails open when the API errors', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
    fetchMock.mockResponseOnce('', { status: 503 })

    expect(await isPasswordBreached(password)).toBe(false)
  })

  it('fails open when the API is unreachable', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
    fetchMock.mockRejectOnce(new Error('offline'))

    expect(await isPasswordBreached(password)).toBe(false)
  })
})
