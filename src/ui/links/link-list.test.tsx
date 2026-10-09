import { render, screen, within } from '@testing-library/react'

import { linkFixture, pressLinkFixture } from '@/lib/links/fixtures'
import type { Link } from '@/lib/links/schemas/db'
import { LinksList } from '@/ui/links/link-list'

const link = (
  base: Link,
  id: string,
  overrides: Partial<Link> = {}
): Link => ({
  ...base,
  id,
  url: `https://${id}.com`,
  ...overrides
})

const relatedA = link(linkFixture, 'related-a')
// saved out of date order; should not be re-sorted
const pressOlder = link(pressLinkFixture, 'press-older', {
  publishDate: new Date('2020-01-01')
})
const relatedB = link(linkFixture, 'related-b')
const pressNewer = link(pressLinkFixture, 'press-newer', {
  publishDate: new Date('2024-01-01')
})

const renderedHrefs = (section: HTMLElement) =>
  within(section)
    .getAllByRole('link')
    .map((anchor) => anchor.getAttribute('href'))

describe('LinksList', () => {
  it('renders press links first, keeping each group’s saved order', () => {
    render(
      <LinksList
        links={[relatedA, pressOlder, relatedB, pressNewer]}
      />
    )

    expect(
      renderedHrefs(screen.getByRole('region', { name: 'Links' }))
    ).toEqual([
      'https://press-older.com',
      'https://press-newer.com',
      'https://related-a.com',
      'https://related-b.com'
    ])
  })

  it('labels the section with a Links heading', () => {
    render(<LinksList links={[relatedA, pressOlder]} />)

    const heading = screen.getByRole('heading', {
      level: 2,
      name: 'Links'
    })
    expect(screen.getByRole('region')).toHaveAccessibleName('Links')
    expect(heading).toHaveClass('visually-hidden')
  })

  it('labels a press-only list with a Press Links heading', () => {
    render(<LinksList links={[pressOlder]} isPress />)

    expect(
      screen.getByRole('region', { name: 'Press Links' })
    ).toBeInTheDocument()
  })

  it('renders nothing for an empty list', () => {
    const { container } = render(<LinksList links={[]} />)

    expect(container).toBeEmptyDOMElement()
  })
})
