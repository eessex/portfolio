import {
  DEFAULT_NAV_ITEMS,
  siteNavItems,
  siteNavPaths
} from '@/lib/site-settings/nav-paths'

describe('siteNavPaths', () => {
  it('offers Projects on artist sites', () => {
    expect(siteNavPaths('music')).toEqual([
      'events',
      'releases',
      'projects',
      'about'
    ])
  })

  it('offers Artists in place of Projects on label sites', () => {
    expect(siteNavPaths('label')).toEqual([
      'events',
      'releases',
      'artists',
      'about'
    ])
  })
})

describe('siteNavItems', () => {
  it('keeps the default menu when none is saved', () => {
    expect(siteNavItems('label')).toEqual(DEFAULT_NAV_ITEMS)
  })

  it('shows a saved projects item as artists on a label site, in place', () => {
    expect(
      siteNavItems('label', [
        { path: 'projects', label: 'Roster' },
        { path: 'about' }
      ])
    ).toEqual([
      { path: 'artists', label: 'Roster' },
      { path: 'about' }
    ])
  })

  it('shows a saved artists item as projects on an artist site', () => {
    expect(siteNavItems('music', [{ path: 'artists' }])).toEqual([
      { path: 'projects' }
    ])
  })

  it('keeps the first of a saved projects and artists pair', () => {
    expect(
      siteNavItems('label', [
        { path: 'artists' },
        { path: 'events' },
        { path: 'projects' }
      ])
    ).toEqual([{ path: 'artists' }, { path: 'events' }])
  })
})
