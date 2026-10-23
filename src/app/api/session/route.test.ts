/** @jest-environment node */

import { GET } from '@/app/api/session/route'
import { mockSession } from '@/test/helpers'

describe('GET /api/session', () => {
  it('returns isAuthed: true with a session', async () => {
    mockSession(true)
    const res = await GET()

    expect(await res.json()).toEqual({ isAuthed: true })
  })

  it('returns isAuthed: false without a session', async () => {
    mockSession(false)
    const res = await GET()

    expect(await res.json()).toEqual({ isAuthed: false })
  })

  it.each([true, false])(
    'is private, no-store (isAuthed: %s)',
    async (isAuthed) => {
      mockSession(isAuthed)
      const res = await GET()

      expect(res.headers.get('Cache-Control')).toBe(
        'private, no-store'
      )
    }
  )
})
