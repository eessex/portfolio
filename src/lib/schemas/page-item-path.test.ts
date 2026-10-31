import { eventFixtureAlpha } from '@/lib/events/fixtures'
import { eventSchema } from '@/lib/events/schemas'
import { projectFixtureAlpha } from '@/lib/projects/fixtures'
import { projectSchema } from '@/lib/projects/schemas'
import { releaseFixtureAlpha } from '@/lib/releases/fixtures'
import { releaseSchema } from '@/lib/releases/schemas'
import { PagePaths } from '@/lib/schemas'

// `path` isn't a column: rows arrive without it and parsing fills it in
describe('page item path', () => {
  it.each([
    [PagePaths.events, eventSchema, eventFixtureAlpha],
    [PagePaths.projects, projectSchema, projectFixtureAlpha],
    [PagePaths.releases, releaseSchema, releaseFixtureAlpha]
  ] as const)(
    'defaults %s rows to their path',
    (path, schema, item) => {
      const { path: _path, ...row } = item
      expect(schema.parse(row).path).toBe(path)
    }
  )

  it('rejects another page path', () => {
    expect(
      eventSchema.safeParse({
        ...eventFixtureAlpha,
        path: PagePaths.releases
      }).success
    ).toBe(false)
  })
})
