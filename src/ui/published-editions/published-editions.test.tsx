import { render, screen } from '@testing-library/react'

import { publishedEditionFixtureAlpha } from '@/lib/published-editions/fixtures'
import type { PublishedEditionClient } from '@/lib/published-editions/schemas/client'
import {
  publisherFixtureAlpha,
  publisherFixtureBeta
} from '@/lib/publishers/fixtures'
import { PublishedEditionsCombined } from '@/ui/published-editions/published-editions'

const houseLp = {
  ...publishedEditionFixtureAlpha,
  format: 'LP',
  publisher: publisherFixtureAlpha
} as PublishedEditionClient
const houseDigital = {
  ...houseLp,
  id: 'c3b8c8e2-4f8a-4c2a-9e2a-2f8b8c8e2f8a',
  format: 'Digital'
} as PublishedEditionClient
const coRelease = {
  ...houseLp,
  id: 'e3b8c8e2-4f8a-4c2a-9e2a-2f8b8c8e2f8a',
  format: 'Cassette',
  publisherId: publisherFixtureBeta.id,
  publisher: publisherFixtureBeta
} as PublishedEditionClient

function items() {
  return screen.getAllByRole('listitem').map((li) => li.textContent)
}

describe('PublishedEditionsCombined', () => {
  it('names every publisher by default', () => {
    render(
      <PublishedEditionsCombined
        publishedEditions={[houseLp, houseDigital, coRelease]}
        format='sm'
      />
    )

    expect(items()).toEqual([
      `LP & Digital, ${publisherFixtureAlpha.name}`,
      `Cassette, ${publisherFixtureBeta.name}`
    ])
  })

  it('leaves out the hidden publisher’s name, keeping a co-release’s', () => {
    render(
      <PublishedEditionsCombined
        publishedEditions={[houseLp, houseDigital, coRelease]}
        format='sm'
        hiddenPublisherId={publisherFixtureAlpha.id}
      />
    )

    expect(items()).toEqual([
      'LP & Digital',
      `Cassette, ${publisherFixtureBeta.name}`
    ])
  })

  it('keeps the date without a stray comma in the long format', () => {
    render(
      <PublishedEditionsCombined
        publishedEditions={[houseLp]}
        hiddenPublisherId={publisherFixtureAlpha.id}
      />
    )

    expect(items()[0]).toMatch(/^LP, [^,]+$/)
    expect(items()[0]).not.toContain(publisherFixtureAlpha.name)
  })
})
