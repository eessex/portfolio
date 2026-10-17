import {
  fireEvent,
  render,
  screen,
  within
} from '@testing-library/react'

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

describe('ItemLayout contact info', () => {
  it('labels untitled entries for screen readers', async () => {
    render(
      await ItemLayout({
        item: {
          ...projectFixtureBand,
          contactInfo: [
            { title: 'Bookings', contact: 'book@example.com' },
            { contact: 'info@example.com' }
          ]
        }
      })
    )

    const address = screen
      .getByRole('article')
      .querySelector('address')!
    const [titled, untitled] =
      within(address).getAllByText(/@example\.com/)
    expect(titled).toHaveTextContent('Bookings: book@example.com')
    expect(untitled).toHaveTextContent('Contact: info@example.com')
    expect(within(address).getByText('Contact:')).toHaveClass(
      'visually-hidden'
    )
  })
})

type LayoutItem = Parameters<typeof ItemLayout>[0]['item']

describe.each([
  ['an event', eventFixturePast],
  ['a release', releaseFixtureAlbum],
  ['a project', projectFixtureBand],
  [
    'the default project',
    { ...projectFixtureBand, isDefaultProject: true }
  ]
] as [string, LayoutItem][])('ItemLayout media on %s', (_, base) => {
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

  async function renderItem(item: Partial<LayoutItem>) {
    render(
      await ItemLayout({
        item: {
          ...base,
          coverImage: undefined,
          images: undefined,
          embedCodes: undefined,
          ...item
        } as LayoutItem,
        children: <p>Children</p>
      })
    )
  }

  function queryRegion(name: string) {
    return screen.queryByRole('region', { name })
  }

  it('puts the cover image at the top of the article', async () => {
    await renderItem({ coverImage })

    const cover = screen.getByText('Cover').closest('figure')!
    const header = screen.getByRole('article').querySelector('header')
    expect(header?.nextElementSibling).toBe(cover)
  })

  it('keeps a lone embed and cover + 1 image inline in the article', async () => {
    await renderItem({
      coverImage,
      images: images.slice(0, 1),
      embedCodes: embedCodes.slice(0, 1)
    })

    const article = screen.getByRole('article')
    expect(article).toHaveTextContent('Video one')
    expect(article).toHaveTextContent('Photo one')
    expect(queryRegion('Video & audio')).not.toBeInTheDocument()
    expect(queryRegion('Press images')).not.toBeInTheDocument()
  })

  it('carousels 2+ embeds and cover + 2 images, before the children', async () => {
    await renderItem({ coverImage, images, embedCodes })

    const media = queryRegion('Video & audio')!
    const pressImages = queryRegion('Press images')!
    const children = screen.getByText('Children')

    expect(screen.getByRole('article')).not.toContainElement(media)
    expect(media.nextElementSibling).toBe(pressImages)
    expect(pressImages.nextElementSibling).toBe(children)
    expect(media).toHaveTextContent('Video two')
    expect(pressImages).toHaveTextContent('Photo two')
    expect(pressImages).not.toHaveTextContent('Cover')
  })

  function openImage(caption: string) {
    fireEvent.click(
      screen
        .getAllByText(caption)[0]
        .closest('figure')!
        .querySelector('button')!
    )
  }

  it('opens the cover in one lightbox that continues into the carousel', async () => {
    await renderItem({ coverImage, images })

    openImage('Cover')

    const dialog = screen.getByRole('dialog', { name: 'Image 1 / 3' })
    expect(within(dialog).getByText('Cover')).toBeInTheDocument()
    fireEvent.click(
      screen.getByRole('button', { name: 'Next image' })
    )
    expect(screen.getByRole('dialog')).toHaveAccessibleName(
      'Image 2 / 3'
    )
    expect(
      within(screen.getByRole('dialog')).getByText('Photo one')
    ).toBeInTheDocument()
  })

  it('opens a carousel image at its place among all the page images', async () => {
    await renderItem({ coverImage, images })

    openImage('Photo two')

    expect(
      screen.getByRole('dialog', { name: 'Image 3 / 3' })
    ).toBeInTheDocument()
  })

  it('includes an inline image after the cover', async () => {
    await renderItem({ coverImage, images: images.slice(0, 1) })

    openImage('Photo one')

    expect(
      screen.getByRole('dialog', { name: 'Image 2 / 2' })
    ).toBeInTheDocument()
  })

  it('keeps 2 images inline without a cover', async () => {
    await renderItem({ images })

    const article = screen.getByRole('article')
    expect(article).toHaveTextContent('Photo one')
    expect(article).toHaveTextContent('Photo two')
    expect(queryRegion('Press images')).not.toBeInTheDocument()
  })
})
