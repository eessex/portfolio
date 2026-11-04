jest.mock('next/headers', () => ({
  headers: jest.fn(async () => new Headers({ cookie: 'old=1' })),
  cookies: jest.fn(async () => ({
    toString: () => 'authjs.session-token=new'
  }))
}))

import { auth } from '@/auth'
import {
  assertAuthed,
  currentUserId,
  isAuthed,
  isAuthedIncludingNewCookies,
  requireAuth
} from '@/lib/auth/guard'

const mockAuth = auth as unknown as jest.Mock

describe('auth/guard', () => {
  describe('#requireAuth', () => {
    it('returns null when a session exists', async () => {
      expect(await requireAuth()).toBeNull()
    })

    it('returns an error response without a session', async () => {
      mockAuth.mockResolvedValueOnce(null)
      expect(await requireAuth()).toEqual({
        ok: false,
        message: 'You must be signed in to perform this action.'
      })
    })
  })

  describe('#assertAuthed', () => {
    it('resolves when a session exists', async () => {
      await expect(assertAuthed()).resolves.toBeUndefined()
    })

    it('throws without a session', async () => {
      mockAuth.mockResolvedValueOnce(null)
      await expect(assertAuthed()).rejects.toThrow('Unauthorized')
    })
  })

  describe('#isAuthed', () => {
    it('returns true when a session exists', async () => {
      expect(await isAuthed()).toBe(true)
    })

    it('returns false without a session', async () => {
      mockAuth.mockResolvedValueOnce(null)
      expect(await isAuthed()).toBe(false)
    })
  })

  describe('#isAuthedIncludingNewCookies', () => {
    it('reads the session from cookies(), not the request headers', async () => {
      expect(await isAuthedIncludingNewCookies()).toBe(true)
      const { req } = mockAuth.mock.calls.at(-1)?.[0]
      expect(req.headers.get('cookie')).toBe(
        'authjs.session-token=new'
      )
    })

    it('returns false without a session', async () => {
      mockAuth.mockResolvedValueOnce(null)
      expect(await isAuthedIncludingNewCookies()).toBe(false)
    })
  })

  describe('#currentUserId', () => {
    it("returns the session's user id", async () => {
      mockAuth.mockResolvedValueOnce({ user: { id: 'user-1' } })
      expect(await currentUserId()).toBe('user-1')
    })

    it('returns null without a session', async () => {
      mockAuth.mockResolvedValueOnce(null)
      expect(await currentUserId()).toBeNull()
    })
  })
})
