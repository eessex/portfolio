import { render, screen } from '@testing-library/react'

import { CreateItemHeader } from '@/app/(item-pages)/list-layout'
import { isAuthed } from '@/lib/auth/guard'
import { isCreatable } from '@/lib/creatable'
import { fetchCachedProjectsFirstPage } from '@/lib/projects/cached'

jest.mock('next/server', () => ({ connection: jest.fn() }))
jest.mock('@/lib/auth/guard', () => ({ isAuthed: jest.fn() }))
jest.mock('@/lib/projects/cached', () => ({
  fetchCachedProjectsFirstPage: jest.fn()
}))

const mockIsAuthed = jest.mocked(isAuthed)
const mockProjects = jest.mocked(fetchCachedProjectsFirstPage)

function mockProjectCount(totalCount: number) {
  mockProjects.mockResolvedValue({
    totalCount
  } as Awaited<ReturnType<typeof fetchCachedProjectsFirstPage>>)
}

describe('CreateItemHeader', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockIsAuthed.mockResolvedValue(true)
    mockProjectCount(1)
  })

  it('links admins to the create form', async () => {
    render(await CreateItemHeader({ itemType: 'releases' }))

    expect(
      screen.getByRole('link', { name: 'New release' })
    ).toHaveAttribute('href', '/releases/new')
  })

  it('renders nothing for visitors, without a creatable check', async () => {
    mockIsAuthed.mockResolvedValue(false)

    expect(
      await CreateItemHeader({ itemType: 'releases' })
    ).toBeNull()
    expect(mockProjects).not.toHaveBeenCalled()
  })

  it('hides "New release" while no project exists', async () => {
    mockProjectCount(0)

    expect(
      await CreateItemHeader({ itemType: 'releases' })
    ).toBeNull()
  })

  it('still offers "New project" with no projects', async () => {
    mockProjectCount(0)

    render(await CreateItemHeader({ itemType: 'projects' }))

    expect(
      screen.getByRole('link', { name: 'New project' })
    ).toHaveAttribute('href', '/projects/new')
  })
})

describe('isCreatable', () => {
  it('fails open when the check throws', async () => {
    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {})
    mockProjects.mockRejectedValue(new Error('DB down'))

    expect(await isCreatable('releases')).toBe(true)
    consoleError.mockRestore()
  })
})
