import { cookies, headers } from 'next/headers'
import { connection } from 'next/server'

import { auth } from '@/auth'
import {
  assertAuthed,
  currentSession,
  currentUserId,
  isAuthed,
  requireAuth
} from '@/lib/auth/guard'

const mockAuth = auth as unknown as jest.Mock

describe('auth/guard', () => {
  describe('#currentSession', () => {
    it('defers to request time before auth() reads the clock', async () => {
      const order: string[] = []
      jest.mocked(connection).mockImplementationOnce(async () => {
        order.push('connection')
      })
      mockAuth.mockImplementationOnce(async () => {
        order.push('auth')
        return null
      })

      await currentSession()

      expect(order).toEqual(['connection', 'auth'])
    })

    // An action's re-render: cookies() has the cookie it just set,
    // headers() still has the request's
    it('reads the session cookie from cookies(), not headers()', async () => {
      jest
        .mocked(headers)
        .mockResolvedValueOnce(
          new Headers({ cookie: 'session=old', host: 'example.com' })
        )
      jest.mocked(cookies).mockResolvedValueOnce({
        toString: () => 'session=new'
      } as Awaited<ReturnType<typeof cookies>>)

      await currentSession()

      const { req } = mockAuth.mock.calls.at(-1)?.[0]
      expect(req.headers.get('cookie')).toBe('session=new')
      expect(req.headers.get('host')).toBe('example.com')
    })
  })

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
