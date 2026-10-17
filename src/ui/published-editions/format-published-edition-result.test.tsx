import { render, screen } from '@testing-library/react'

import { publishedEditionFixtureAlpha } from '@/lib/published-editions/fixtures'
import { publisherFixtureAlpha } from '@/lib/publishers/fixtures'
import {
  formatNewPublishedEditionSummary,
  formatPublishedEditionResult
} from '@/ui/published-editions/format-published-edition-result'

const edition = {
  ...publishedEditionFixtureAlpha,
  publisher: publisherFixtureAlpha
}
const actions = {
  editButton: null,
  onRemove: jest.fn(),
  removeLabel: 'Remove'
}

describe('formatPublishedEditionResult', () => {
  it("names the edition's publisher", () => {
    render(formatPublishedEditionResult(edition))

    expect(
      screen.getByText(new RegExp(publisherFixtureAlpha.name))
    ).toBeInTheDocument()
  })

  it('names a newly selected publisher after an edit', () => {
    render(
      formatPublishedEditionResult({
        ...edition,
        publisherName: 'Other Label'
      } as typeof edition)
    )

    expect(screen.getByText(/Other Label/)).toBeInTheDocument()
  })

  it('names a publisher renamed inline', () => {
    render(
      formatPublishedEditionResult({
        ...edition,
        publisherName: publisherFixtureAlpha.name,
        'publisher.name': 'Renamed Label'
      } as typeof edition)
    )

    expect(screen.getByText(/Renamed Label/)).toBeInTheDocument()
  })
})

describe('formatNewPublishedEditionSummary', () => {
  it('names a selected publisher', () => {
    render(
      formatNewPublishedEditionSummary(
        { format: 'LP', publisherName: 'Other Label' },
        undefined,
        actions
      )
    )

    expect(screen.getByText(/Other Label/)).toBeInTheDocument()
  })

  it('names a publisher created inline', () => {
    render(
      formatNewPublishedEditionSummary(
        { format: 'LP', 'publisher.name': 'New Label' },
        undefined,
        actions
      )
    )

    expect(screen.getByText(/New Label/)).toBeInTheDocument()
  })
})
