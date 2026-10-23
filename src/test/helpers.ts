/** testing-only helper functions */

import { auth } from '@/auth'

export function mockFile(
  name = 'test.jpg',
  size = 1024,
  type = 'image/jpeg'
): File {
  const content = new Uint8Array(size)
  return new File([content], name, { type })
}

export const formDataFromObject = (v: Record<string, unknown>) => {
  const fd = new FormData()

  Object.entries(v).forEach(([k, val]) => {
    if (val === undefined || val === null) return

    if (val instanceof File) {
      fd.append(k, val)
      return
    }

    if (Array.isArray(val)) {
      val.forEach((item) => {
        if (item === undefined || item === null) return
        fd.append(k, String(item))
      })
      return
    }

    fd.append(k, String(val))
  })

  return fd
}

export function apiRequest(
  path: string,
  params: Record<string, string> = {}
) {
  const search = new URLSearchParams(params).toString()
  return new Request(
    `http://localhost${path}${search ? `?${search}` : ''}`
  )
}

/** Sets the next `auth()` call's session (see jest.setup.ts) */
export function mockSession(isAuthed: boolean) {
  const mockAuth = auth as unknown as jest.Mock
  mockAuth.mockResolvedValueOnce(
    isAuthed
      ? { user: { name: 'Test User', email: 'test@example.com' } }
      : null
  )
}
