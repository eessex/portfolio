import {
  isProjectDateShown,
  siteKindForType,
  siteProfile
} from '@/lib/projects/site-profile'

describe('siteKindForType', () => {
  it('is a label site for a recordLabel default project', () => {
    expect(siteKindForType('recordLabel')).toBe('label')
  })

  it('is a music site for any other type, or none', () => {
    expect(siteKindForType('band')).toBe('music')
    expect(siteKindForType('radioShow')).toBe('music')
    expect(siteKindForType(undefined)).toBe('music')
  })
})

describe('siteProfile', () => {
  it('words the release form by role on label sites', () => {
    expect(siteProfile('label')).toEqual({
      projectPickerLabel: 'Roster artist',
      artistFieldLabel: 'Credited as'
    })
  })

  it('keeps today’s wording on music sites', () => {
    expect(siteProfile('music')).toEqual({
      projectPickerLabel: 'Project',
      artistFieldLabel: 'Artist name'
    })
  })
})

describe('isProjectDateShown', () => {
  it('hides roster artists’ dates on label sites', () => {
    expect(isProjectDateShown('band', 'label')).toBe(false)
    expect(isProjectDateShown('solo', 'label')).toBe(false)
    expect(isProjectDateShown('collaborative', 'label')).toBe(false)
  })

  it('shows non-artist projects’ dates on label sites', () => {
    expect(isProjectDateShown('recordLabel', 'label')).toBe(true)
    expect(isProjectDateShown('eventSeries', 'label')).toBe(true)
    expect(isProjectDateShown(undefined, 'label')).toBe(true)
  })

  it('shows every date on other sites', () => {
    expect(isProjectDateShown('band', 'music')).toBe(true)
    expect(isProjectDateShown('band', 'visual')).toBe(true)
  })
})
