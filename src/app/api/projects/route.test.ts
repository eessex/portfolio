/** @jest-environment node */

jest.mock('@/lib/projects/data', () => ({ fetchProjects: jest.fn() }))

import { GET } from '@/app/api/projects/route'
import { fetchProjects } from '@/lib/projects/data'
import { apiRequest, mockSession } from '@/test/helpers'

const mockFetch = jest.mocked(fetchProjects)
const page = { projects: [], nextCursor: undefined, totalCount: 0 }

describe('GET /api/projects', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockFetch.mockResolvedValue(page as never)
  })

  it('passes isAuthed, cursor, query and options in order', async () => {
    await GET(
      apiRequest('/api/projects', {
        cursor: 'c1',
        query: 'q',
        isDefaultExcluded: 'true'
      })
    )

    expect(mockFetch).toHaveBeenCalledWith(true, 'c1', 'q', {
      isDefaultExcluded: true
    })
  })

  it('passes missing params as undefined', async () => {
    await GET(apiRequest('/api/projects'))

    expect(mockFetch).toHaveBeenCalledWith(
      true,
      undefined,
      undefined,
      {
        isDefaultExcluded: false
      }
    )
  })

  it('passes empty params as undefined', async () => {
    await GET(apiRequest('/api/projects', { cursor: '', query: '' }))

    expect(mockFetch).toHaveBeenCalledWith(
      true,
      undefined,
      undefined,
      {
        isDefaultExcluded: false
      }
    )
  })

  it.each(['false', '1', ''])(
    'only excludes the default for isDefaultExcluded=true (got %p)',
    async (isDefaultExcluded) => {
      await GET(apiRequest('/api/projects', { isDefaultExcluded }))

      expect(mockFetch.mock.calls[0]?.[3]).toEqual({
        isDefaultExcluded: false
      })
    }
  )

  it('passes isAuthed: false without a session', async () => {
    mockSession(false)
    await GET(apiRequest('/api/projects'))

    expect(mockFetch.mock.calls[0]?.[0]).toBe(false)
  })

  it('returns the page with a private, no-store header', async () => {
    const res = await GET(apiRequest('/api/projects'))

    expect(await res.json()).toEqual({ projects: [], totalCount: 0 })
    expect(res.headers.get('Cache-Control')).toBe('private, no-store')
  })

  it('wraps fetch errors', async () => {
    const cause = new Error('db down')
    mockFetch.mockRejectedValueOnce(cause)

    await expect(
      GET(apiRequest('/api/projects'))
    ).rejects.toMatchObject({
      message: 'Failed to fetch projects.',
      cause
    })
  })
})
