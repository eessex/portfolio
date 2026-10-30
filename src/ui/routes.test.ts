import { projectFixtureBand } from '@/lib/projects/fixtures'
import {
  dashboardItemEditUrl,
  dashboardUrl,
  editUrl,
  isEditOrNewUrl,
  itemEditUrl,
  itemUrl,
  newUrl,
  pageItemUrl
} from '@/ui/routes'

describe('itemUrl', () => {
  it('links a page item to its slug', () => {
    expect(itemUrl(projectFixtureBand)).toBe(
      `/projects/${projectFixtureBand.slug}`
    )
  })

  it('links the default project to /about', () => {
    expect(
      itemUrl({ ...projectFixtureBand, isDefaultProject: true })
    ).toBe('/about')
  })
})

describe('itemEditUrl', () => {
  it('edits a page item at its slug', () => {
    expect(itemEditUrl(projectFixtureBand)).toBe(
      `/projects/${projectFixtureBand.slug}/edit`
    )
  })

  it('edits the default project at /about/edit', () => {
    expect(
      itemEditUrl({ ...projectFixtureBand, isDefaultProject: true })
    ).toBe('/about/edit')
  })
})

describe('page and dashboard urls', () => {
  it('builds page item, list and create urls', () => {
    expect(pageItemUrl('events', 'show')).toBe('/events/show')
    expect(editUrl(pageItemUrl('events', 'show'))).toBe(
      '/events/show/edit'
    )
    expect(newUrl('/releases')).toBe('/releases/new')
  })

  it('snake-cases dashboard item types', () => {
    expect(dashboardUrl('embedCodes')).toBe('/dashboard/embed_codes')
    expect(newUrl(dashboardUrl('venues'))).toBe(
      '/dashboard/venues/new'
    )
    expect(dashboardItemEditUrl('embedCodes', 'id-1')).toBe(
      '/dashboard/embed_codes/id-1/edit'
    )
  })
})

describe('isEditOrNewUrl', () => {
  it.each(['/events/show/edit', '/about/edit', '/releases/new'])(
    'matches %s',
    (pathname) => {
      expect(isEditOrNewUrl(pathname)).toBe(true)
    }
  )

  it.each(['/events/show', '/about', '/events/new-years-eve', '/'])(
    'does not match %s',
    (pathname) => {
      expect(isEditOrNewUrl(pathname)).toBe(false)
    }
  )
})
