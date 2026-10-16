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

  it('renders plain links as a separate list after press links', () => {
    render(<LinksList links={[relatedA, pressOlder, relatedB]} />)

    const [pressList, plainList] = within(
      screen.getByRole('region', { name: 'Links' })
    ).getAllByRole('list')
    expect(renderedHrefs(pressList)).toEqual([
      'https://press-older.com'
    ])
    expect(renderedHrefs(plainList)).toEqual([
      'https://related-a.com',
      'https://related-b.com'
    ])
  })

  it('renders only the plain list when there are no press links', () => {
    render(<LinksList links={[relatedA, relatedB]} />)

    expect(screen.getAllByRole('list')).toHaveLength(1)
  })

  it('renders quoted press links before unquoted ones, matching the picker’s groups', () => {
    const unquoted = link(pressLinkFixture, 'press-unquoted', {
      quotation: undefined
    })
    render(<LinksList links={[unquoted, pressOlder]} />)

    expect(
      renderedHrefs(screen.getByRole('region', { name: 'Links' }))
    ).toEqual([
      'https://press-older.com',
      'https://press-unquoted.com'
    ])
  })

  it('shows every press link, without a reveal button', () => {
    const press = Array.from({ length: 9 }, (_, i) =>
      link(pressLinkFixture, `press-${i}`, { quotation: undefined })
    )
    render(<LinksList links={press} />)

    expect(screen.getAllByRole('link')).toHaveLength(9)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
