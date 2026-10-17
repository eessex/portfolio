import { render, screen, waitFor } from '@testing-library/react'

import { projectFixtureBand } from '@/lib/projects/fixtures'
import type { ProjectClient } from '@/lib/projects/types'
import { MoreProjectsList } from '@/ui/projects/more-projects-list'
import { resetIsAdminCache } from '@/ui/useIsAdmin'

const draftProject: ProjectClient = {
  ...projectFixtureBand,
  id: '550e8400-e29b-41d4-a716-446655440011',
  slug: 'draft-project',
  title: 'Unpublished draft project',
  isPublished: false
}

function mockFetch(allProjects: ProjectClient[], isAdmin = true) {
  global.fetch = jest.fn().mockImplementation(
    async (url: unknown) =>
      ({
        json: async () =>
          String(url).includes('/api/session')
            ? { isAuthed: isAdmin }
            : { res: { allProjects } }
      }) as Response
  )
}

function fetchedUrls() {
  return (global.fetch as jest.Mock).mock.calls.map((call) =>
    String(call[0])
  )
}

describe('MoreProjectsList', () => {
  beforeEach(() => {
    global.fetch = jest.fn()
    jest.clearAllMocks()
    resetIsAdminCache()
  })

  it('renders initial projects and only checks the session for anonymous visitors', async () => {
    mockFetch([projectFixtureBand, draftProject], false)

    render(
      <MoreProjectsList initialProjects={[projectFixtureBand]} />
    )

    expect(
      screen.getByText(projectFixtureBand.title)
    ).toBeInTheDocument()

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled()
    })
    expect(fetchedUrls()).toEqual(['/api/session'])
    expect(
      screen.queryByText(draftProject.title)
    ).not.toBeInTheDocument()
  })

  it('refetches the full set for admins and replaces the list', async () => {
    mockFetch([projectFixtureBand, draftProject])

    render(
      <MoreProjectsList initialProjects={[projectFixtureBand]} />
    )

    await waitFor(() => {
      expect(screen.getByText(draftProject.title)).toBeInTheDocument()
    })
    expect(fetchedUrls()).toEqual([
      '/api/session',
      '/api/projects?isDefaultExcluded=true'
    ])
    expect(
      screen.getByText(projectFixtureBand.title)
    ).toBeInTheDocument()
  })

  it('reveals the accordion for a published-empty list once drafts arrive', async () => {
    mockFetch([draftProject])

    const { container } = render(
      <MoreProjectsList initialProjects={[]} />
    )

    expect(container).toBeEmptyDOMElement()

    await waitFor(() => {
      expect(screen.getByText(draftProject.title)).toBeInTheDocument()
    })
    expect(screen.getByText('More Projects')).toBeInTheDocument()
  })

  it('keeps the published list when the augment fetch fails', async () => {
    global.fetch = jest
      .fn()
      .mockImplementation(async (url: unknown) => {
        if (String(url).includes('/api/session')) {
          return {
            json: async () => ({ isAuthed: true })
          } as Response
        }
        throw new Error('network error')
      })

    render(
      <MoreProjectsList initialProjects={[projectFixtureBand]} />
    )

    await waitFor(() => {
      expect(fetchedUrls()).toContain(
        '/api/projects?isDefaultExcluded=true'
      )
    })
    expect(
      screen.getByText(projectFixtureBand.title)
    ).toBeInTheDocument()
  })
})
