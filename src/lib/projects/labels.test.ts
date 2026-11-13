import {
  ARTIST_LABEL,
  ARTISTS_LABEL,
  PROJECT_LABEL,
  PROJECTS_LABEL
} from '@/lib/projects/labels'

describe('project labels', () => {
  it('names projects and a label roster', () => {
    expect([
      PROJECT_LABEL,
      PROJECTS_LABEL,
      ARTIST_LABEL,
      ARTISTS_LABEL
    ]).toEqual(['Project', 'Projects', 'Artist', 'Artists'])
  })
})
