jest.mock('@/lib/users/data', () => ({
  fetchSessionVersion: jest.fn()
}))

import { checkSessionVersion } from '@/lib/auth/session-version'
import { fetchSessionVersion } from '@/lib/users/data'

const mockFetchSessionVersion = jest.mocked(fetchSessionVersion)

const userId = '11111111-1111-1111-1111-111111111111'

describe('#checkSessionVersion', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('copies the version into the token at sign-in', async () => {
    const token = await checkSessionVersion({
      token: { sub: userId },
      user: { id: userId, sessionVersion: 3 }
    })

    expect(token).toEqual({ sub: userId, sessionVersion: 3 })
    expect(mockFetchSessionVersion).not.toHaveBeenCalled()
  })

  it('keeps a token whose version matches', async () => {
    mockFetchSessionVersion.mockResolvedValue(3)
    const token = { sub: userId, sessionVersion: 3 }

    expect(await checkSessionVersion({ token })).toBe(token)
    expect(mockFetchSessionVersion).toHaveBeenCalledWith(userId)
  })

  it('ends a session whose version is stale', async () => {
    mockFetchSessionVersion.mockResolvedValue(4)

    expect(
      await checkSessionVersion({
        token: { sub: userId, sessionVersion: 3 }
      })
    ).toBeNull()
  })

  it('treats a token with no version as version 0', async () => {
    mockFetchSessionVersion.mockResolvedValue(0)
    const token = { sub: userId }

    expect(await checkSessionVersion({ token })).toBe(token)
  })

  it('ends the session of a removed user', async () => {
    mockFetchSessionVersion.mockResolvedValue(null)

    expect(
      await checkSessionVersion({
        token: { sub: userId, sessionVersion: 0 }
      })
    ).toBeNull()
  })

  it('ends a session with no user id', async () => {
    expect(await checkSessionVersion({ token: {} })).toBeNull()
  })

  it('keeps the session when the lookup fails', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
    mockFetchSessionVersion.mockRejectedValue(new Error('db down'))
    const token = { sub: userId, sessionVersion: 0 }

    expect(await checkSessionVersion({ token })).toBe(token)
  })
})
