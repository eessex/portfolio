import { render, screen, waitFor } from '@testing-library/react'

import { imageFixture } from '@/lib/images/fixtures'
import { projectFixtureBand } from '@/lib/projects/fixtures'
import type { ProjectClient } from '@/lib/projects/types'
import { ProjectsCarousel } from '@/ui/projects/projects-carousel'
import { resetIsAdminCache } from '@/ui/useIsAdmin'

const draftProject: ProjectClient = {
  ...projectFixtureBand,
  id: '550e8400-e29b-41d4-a716-446655440011',
  slug: 'draft-project',
  title: 'Unpublished draft project',
  isPublished: false
}

function mockFetch(allProjects: ProjectClient[], isAdmin: boolean) {
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

describe('ProjectsCarousel', () => {
  beforeEach(() => {
    resetIsAdminCache()
    mockFetch([], false)
  })

  it('links each project with its image, type and years', () => {
    render(
      <ProjectsCarousel
        initialProjects={[
          { ...projectFixtureBand, coverImage: imageFixture }
        ]}
      />
    )

    const link = screen.getByRole('link', { name: /Band 1/ })
    expect(link).toHaveAttribute('href', '/projects/band-1')
    expect(link).toHaveTextContent('Band')
    expect(link).toHaveTextContent('2025–present')
    expect(link.querySelector('img')).toBeInTheDocument()
    expect(
      screen.getByRole('region', { name: 'Projects' })
    ).toBeInTheDocument()
  })

  it('leaves out the years without a start date', () => {
    render(
      <ProjectsCarousel
        initialProjects={[
          { ...projectFixtureBand, startDate: undefined }
        ]}
      />
    )

    expect(screen.queryByText(/present/)).not.toBeInTheDocument()
  })

  it('renders nothing without projects', () => {
    const { container } = render(
      <ProjectsCarousel initialProjects={[]} />
    )

    expect(container).toBeEmptyDOMElement()
  })

  it('adds drafts, badged, for a signed-in admin', async () => {
    mockFetch([projectFixtureBand, draftProject], true)

    render(
      <ProjectsCarousel initialProjects={[projectFixtureBand]} />
    )

    await waitFor(() => {
      expect(
        screen.getByRole('link', {
          name: /Unpublished draft project/
        })
      ).toHaveTextContent('Unpublished')
    })
    expect(
      screen.getByRole('link', { name: /Band 1/ })
    ).not.toHaveTextContent('Unpublished')
  })
})
