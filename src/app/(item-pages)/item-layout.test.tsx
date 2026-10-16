import { render, screen } from '@testing-library/react'

import ItemLayout, {
  generateItemMetadata
} from '@/app/(item-pages)/item-layout'
import { embedCodeFixture } from '@/lib/embed-codes/fixtures'
import {
  eventFixturePast,
  eventFixtureUpcoming
} from '@/lib/events/fixtures'
import { imageFixture } from '@/lib/images/fixtures'
import { projectFixtureBand } from '@/lib/projects/fixtures'
import { releaseFixtureAlbum } from '@/lib/releases/fixtures'
import { PagePaths } from '@/lib/schemas'
import { resolveSlug } from '@/lib/slug/data'

jest.mock('@/lib/slug/data', () => ({
  resolveSlug: jest.fn()
}))

const mockResolveSlug = jest.mocked(resolveSlug)

describe('generateItemMetadata', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('uses shortDescription as the meta description for releases', async () => {
    mockResolveSlug.mockResolvedValue({
      id: releaseFixtureAlbum.id,
      slug: releaseFixtureAlbum.slug,
      isRedirect: false
    })
    const fetchById = jest.fn().mockResolvedValue(releaseFixtureAlbum)

    const meta = await generateItemMetadata(
      Promise.resolve({ slug: releaseFixtureAlbum.slug }),
      PagePaths.releases,
      fetchById
    )

    expect(meta.description).toBe(
      releaseFixtureAlbum.shortDescription
    )
  })

  it('uses shortDescription as the meta description for projects', async () => {
    mockResolveSlug.mockResolvedValue({
      id: projectFixtureBand.id,
      slug: projectFixtureBand.slug,
      isRedirect: false
    })
    const fetchById = jest.fn().mockResolvedValue(projectFixtureBand)

    const meta = await generateItemMetadata(
      Promise.resolve({ slug: projectFixtureBand.slug }),
      PagePaths.projects,
      fetchById
    )

    expect(meta.description).toBe(projectFixtureBand.shortDescription)
  })

  it('points the default project canonical at /about', async () => {
    mockResolveSlug.mockResolvedValue({
      id: projectFixtureBand.id,
      slug: projectFixtureBand.slug,
      isRedirect: true
    })
    const fetchById = jest.fn().mockResolvedValue({
      ...projectFixtureBand,
      isDefaultProject: true
    })

    const meta = await generateItemMetadata(
      Promise.resolve({ slug: 'old-slug' }),
      PagePaths.projects,
      fetchById
    )

    expect(meta.alternates).toEqual({ canonical: '/about' })
  })

  it('points a historical slug canonical at the current slug', async () => {
    mockResolveSlug.mockResolvedValue({
      id: projectFixtureBand.id,
      slug: projectFixtureBand.slug,
      isRedirect: true
    })
    const fetchById = jest.fn().mockResolvedValue(projectFixtureBand)

    const meta = await generateItemMetadata(
      Promise.resolve({ slug: 'old-slug' }),
      PagePaths.projects,
      fetchById
    )

    expect(meta.alternates).toEqual({
      canonical: `/projects/${projectFixtureBand.slug}`
    })
  })

  it('prefers shortDescription over the generated event description', async () => {
    mockResolveSlug.mockResolvedValue({
      id: eventFixturePast.id,
      slug: eventFixturePast.slug,
      isRedirect: false
    })
    const fetchById = jest.fn().mockResolvedValue(eventFixturePast)

    const meta = await generateItemMetadata(
      Promise.resolve({ slug: eventFixturePast.slug }),
      PagePaths.events,
      fetchById
    )

    expect(meta.description).toBe(eventFixturePast.shortDescription)
  })

  it('falls back to the generated event description when shortDescription is absent', async () => {
    mockResolveSlug.mockResolvedValue({
      id: eventFixtureUpcoming.id,
      slug: eventFixtureUpcoming.slug,
      isRedirect: false
    })
    const fetchById = jest
      .fn()
      .mockResolvedValue(eventFixtureUpcoming)

    const meta = await generateItemMetadata(
      Promise.resolve({ slug: eventFixtureUpcoming.slug }),
      PagePaths.events,
      fetchById
    )

    expect(eventFixtureUpcoming.shortDescription).toBeUndefined()
    expect(meta.description).toContain('Live event at')
  })

  it('leaves the description undefined for releases without shortDescription', async () => {
    const releaseWithoutShortDescription = {
      ...releaseFixtureAlbum,
      shortDescription: undefined
    }
    mockResolveSlug.mockResolvedValue({
      id: releaseWithoutShortDescription.id,
      slug: releaseWithoutShortDescription.slug,
      isRedirect: false
    })
    const fetchById = jest
      .fn()
      .mockResolvedValue(releaseWithoutShortDescription)

    const meta = await generateItemMetadata(
      Promise.resolve({ slug: releaseWithoutShortDescription.slug }),
      PagePaths.releases,
      fetchById
    )

    expect(meta.description).toBeUndefined()
  })
})

describe('ItemLayout header', () => {
  async function renderLayout(
    item: Parameters<typeof ItemLayout>[0]['item']
  ) {
    render(await ItemLayout({ item }))
  }

  it('shows the category, title and date for a project', async () => {
    await renderLayout(projectFixtureBand)

    expect(
      screen.getByRole('heading', { level: 1 })
    ).toHaveTextContent(projectFixtureBand.title)
    expect(
      screen.getByRole('link', { name: /band/i })
    ).toHaveAttribute('href', '/projects')
    expect(screen.getByText(/2025/)).toBeInTheDocument()
  })

  it('shows "About" with no category or date for the default project', async () => {
    await renderLayout({
      ...projectFixtureBand,
      isDefaultProject: true
    })

    expect(
      screen.getByRole('heading', { level: 1 })
    ).toHaveTextContent('About')
    expect(
      screen.queryByText(projectFixtureBand.title)
    ).not.toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    expect(screen.queryByText(/2025/)).not.toBeInTheDocument()
  })

  it('keeps the draft badge on an unpublished default project', async () => {
    await renderLayout({
      ...projectFixtureBand,
      isDefaultProject: true,
      isPublished: false
    })

    expect(screen.getByText('Unpublished')).toBeInTheDocument()
  })

  it('styles only the default project with the legacy About header', async () => {
    await renderLayout({
      ...projectFixtureBand,
      isDefaultProject: true
    })
    expect(screen.getByRole('article').parentElement).toHaveClass(
      'default-project'
    )
  })

  it('keeps the centered header on other projects', async () => {
    await renderLayout(projectFixtureBand)

    expect(screen.getByRole('article').parentElement).not.toHaveClass(
      'default-project'
    )
  })
})

describe('ItemLayout on the default project', () => {
  const images = [
    { ...imageFixture, type: 'press' as const, caption: 'Photo one' },
    {
      ...imageFixture,
      id: 'b5a0c1de-1111-4222-8333-944455556666',
      type: 'press' as const,
      caption: 'Photo two'
    }
  ]
  const coverImage = {
    ...imageFixture,
    id: 'e8d3f4a1-4444-4555-8666-c77788889999',
    caption: 'Cover'
  }
  const embedCodes = [
    { ...embedCodeFixture, caption: 'Video one' },
    {
      ...embedCodeFixture,
      id: 'd7c2e3f0-3333-4444-8555-b66677778888',
      caption: 'Video two'
    }
  ]

  async function renderDefault(
    item: Partial<Parameters<typeof ItemLayout>[0]['item']>
  ) {
    render(
      await ItemLayout({
        item: {
          ...projectFixtureBand,
          isDefaultProject: true,
          ...item
        } as Parameters<typeof ItemLayout>[0]['item'],
        children: <p>All projects</p>
      })
    )
  }

  function region(name: string) {
    return screen.getByRole('region', {
      name
    })
  }

  it('orders embed and image carousels around the children, outside the article', async () => {
    await renderDefault({ coverImage, images, embedCodes })

    const media = region('Video & audio')
    const pressImages = region('Press images')
    const projects = screen.getByText('All projects')

    expect(screen.getByRole('article')).not.toContainElement(media)
    expect(media.nextElementSibling).toBe(projects)
    expect(projects.nextElementSibling).toBe(pressImages)
    expect(pressImages).toHaveTextContent('Photo two')
    expect(media).toHaveTextContent('Video two')
  })

  it('keeps a lone embed and image inline in the article', async () => {
    await renderDefault({
      images: images.slice(0, 1),
      embedCodes: embedCodes.slice(0, 1)
    })

    const article = screen.getByRole('article')
    expect(article).toHaveTextContent('Video one')
    expect(article).toHaveTextContent('Photo one')
    expect(
      screen.getByRole('link', { name: 'Download high-res ↓' })
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('region', { name: /Video & audio/ })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('region', { name: /Press images/ })
    ).not.toBeInTheDocument()
  })

  it('carousels images once there are 3, counting the cover', async () => {
    await renderDefault({ coverImage, images })

    const carousel = region('Press images')
    expect(carousel).toHaveTextContent('Photo one')
    expect(carousel).toHaveTextContent('Photo two')
    expect(carousel).not.toHaveTextContent('Cover')
  })

  it('keeps fewer than 3 images inline in the article', async () => {
    await renderDefault({ coverImage, images: images.slice(0, 1) })

    expect(screen.getByRole('article')).toHaveTextContent('Photo one')
    expect(
      screen.queryByRole('region', { name: /Press images/ })
    ).not.toBeInTheDocument()
  })

  it('keeps 2 images inline without a cover', async () => {
    await renderDefault({ images })

    const article = screen.getByRole('article')
    expect(article).toHaveTextContent('Photo one')
    expect(article).toHaveTextContent('Photo two')
    expect(
      screen.queryByRole('region', { name: /Press images/ })
    ).not.toBeInTheDocument()
  })
})

describe('ItemLayout embed codes', () => {
  const embedCodes = [
    { ...embedCodeFixture, caption: 'Video one' },
    {
      ...embedCodeFixture,
      id: 'd7c2e3f0-3333-4444-8555-b66677778888',
      caption: 'Video two'
    }
  ]

  it('carousels 2+ embeds below the article on any page', async () => {
    render(
      await ItemLayout({
        item: { ...eventFixturePast, embedCodes },
        children: <p>More events</p>
      })
    )

    const media = screen.getByRole('region', {
      name: 'Video & audio'
    })
    expect(screen.getByRole('article')).not.toContainElement(media)
    expect(media).toHaveTextContent('Video two')
    expect(media.nextElementSibling).toHaveTextContent('More events')
  })

  it('keeps a lone embed inline on any page', async () => {
    render(
      await ItemLayout({
        item: {
          ...eventFixturePast,
          embedCodes: embedCodes.slice(0, 1)
        }
      })
    )

    expect(screen.getByRole('article')).toHaveTextContent('Video one')
    expect(
      screen.queryByRole('region', { name: /Video & audio/ })
    ).not.toBeInTheDocument()
  })
})
