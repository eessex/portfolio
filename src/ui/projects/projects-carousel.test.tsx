import {
  render,
  screen,
  waitFor,
  within
} from '@testing-library/react'

import { imageFixture } from '@/lib/images/fixtures'
import { projectFixtureBand } from '@/lib/projects/fixtures'
import type { ProjectClient } from '@/lib/projects/types'
import { ProjectsCarousel } from '@/ui/projects/projects-carousel'
import { resetIsAdminCache } from '@/ui/use-is-admin'

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

  it('renders each project as an ItemCard with its image, type and years', () => {
    render(
      <ProjectsCarousel
        initialProjects={[
          { ...projectFixtureBand, coverImage: imageFixture }
        ]}
      />
    )

    const link = screen.getByRole('link', { name: /Band 1/ })
    expect(link).toHaveAttribute('href', '/projects/band-1')
    const card = link.closest('article')!
    expect(
      screen.getByRole('heading', { level: 3, name: /Band 1/ })
    ).toContainElement(link)
    expect(card).toHaveTextContent('Band')
    expect(card).toHaveTextContent('2025–present')
    const img = card.querySelector('img')!
    expect(img).toHaveAttribute('loading', 'lazy')
    // sized to the 300px row height, not the list card's 350px width
    expect(img).toHaveAttribute('height', '300')
    expect(
      screen.getByRole('region', { name: 'Projects' })
    ).toBeInTheDocument()
  })

  it('shows the draft badge on the image, keeping it in the title for screen readers', () => {
    render(
      <ProjectsCarousel
        initialProjects={[
          { ...draftProject, coverImage: imageFixture }
        ]}
      />
    )

    const card = screen
      .getByRole('link', { name: /Unpublished draft project/ })
      .closest('article')!
    const media = card.querySelector('a[aria-hidden="true"]')!
    expect(media.querySelector('img')).toBeInTheDocument()
    expect(media.querySelector('mark')).toHaveTextContent(
      'Unpublished'
    )
    expect(card.querySelector('h3 mark')).toBeNull()
    expect(card.querySelector('h3')).toHaveTextContent('Unpublished')
  })

  it('holds the badge in a placeholder when there is no cover', () => {
    render(
      <ProjectsCarousel
        initialProjects={[{ ...draftProject, coverImage: undefined }]}
      />
    )

    const media = document.querySelector('a[aria-hidden="true"]')!
    expect(media.querySelector('img')).toBeNull()
    expect(media.querySelector('mark')).toHaveTextContent(
      'Unpublished'
    )
  })

  it('shows the media icons beside the title', () => {
    render(
      <ProjectsCarousel
        initialProjects={[
          { ...projectFixtureBand, hasAudio: true, hasVideo: true }
        ]}
      />
    )

    const card = screen
      .getByRole('link', { name: /Band 1/ })
      .closest('article')!
    expect(
      within(card).getByLabelText('Contains audio')
    ).toBeInTheDocument()
    expect(
      within(card).getByLabelText('Contains video')
    ).toBeInTheDocument()
  })

  it('leaves out the media icons without media', () => {
    render(
      <ProjectsCarousel
        initialProjects={[
          { ...projectFixtureBand, hasAudio: false, hasVideo: false }
        ]}
      />
    )

    expect(
      screen.queryByLabelText(/Contains (audio|video)/)
    ).not.toBeInTheDocument()
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

  it('refetches without the same types for an admin', async () => {
    mockFetch([], true)

    render(
      <ProjectsCarousel
        initialProjects={[projectFixtureBand]}
        excludedTypes={['band', 'solo']}
      />
    )

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/projects?isDefaultExcluded=true&excludedTypes=band%2Csolo'
      )
    })
  })
})
