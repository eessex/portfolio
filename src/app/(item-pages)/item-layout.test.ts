import { generateItemMetadata } from '@/app/(item-pages)/item-layout'
import {
  eventFixturePast,
  eventFixtureUpcoming
} from '@/lib/events/fixtures'
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
