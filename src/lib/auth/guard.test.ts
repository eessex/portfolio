import { auth } from '@/auth'
import { assertAuthed, isAuthed, requireAuth } from '@/lib/auth/guard'

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
})
