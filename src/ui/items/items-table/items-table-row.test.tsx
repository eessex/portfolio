import { render } from '@testing-library/react'

import { imageFixture } from '@/lib/images/fixtures'
import { projectFixtureBand } from '@/lib/projects/fixtures'
import type { ProjectClient } from '@/lib/projects/types'
import { PagePaths } from '@/lib/schemas'
import { ItemsTableRow } from '@/ui/items/items-table/items-table-row'

function renderRow(item: ProjectClient, isExpanded: boolean) {
  const { container } = render(
    <table>
      <tbody>
        <ItemsTableRow
          item={item}
          itemType={PagePaths.projects}
          isExpanded={isExpanded}
        />
      </tbody>
    </table>
  )
  return container.querySelector('tr')!
}

describe('ItemsTableRow', () => {
  it('shows no date with isDateHidden', () => {
    const { container } = render(
      <table>
        <tbody>
          <ItemsTableRow
            item={projectFixtureBand}
            itemType={PagePaths.projects}
            isDateHidden
          />
        </tbody>
      </table>
    )

    expect(container.querySelector('time')).toBeNull()
    expect(
      renderRow(projectFixtureBand, false).querySelector('time')
    ).not.toBeNull()
  })

  it('sizes an expanded card by its cover aspect', () => {
    const row = renderRow(
      {
        ...projectFixtureBand,
        coverImage: { ...imageFixture, aspect: 1.5 }
      },
      true
    )

    expect(row.style.getPropertyValue('--aspect')).toBe('1.5')
  })

  it('sizes an expanded card without a cover as a square', () => {
    const row = renderRow(
      { ...projectFixtureBand, coverImage: undefined },
      true
    )

    expect(row.style.getPropertyValue('--aspect')).toBe('1')
    expect(row.querySelector('td')).toBeEmptyDOMElement()
  })

  it('sets no aspect on a compact row', () => {
    const row = renderRow(projectFixtureBand, false)

    expect(row.style.getPropertyValue('--aspect')).toBe('')
  })

  it('puts an expanded draft row’s badge on the image, not the title', () => {
    const row = renderRow(
      { ...projectFixtureBand, isPublished: false },
      true
    )

    const [imageCell] = row.querySelectorAll('td')
    expect(imageCell.querySelector('mark')).toHaveTextContent(
      'Unpublished'
    )
    const titleLink = row.querySelector('a')!
    expect(titleLink.querySelector('mark')).toBeNull()
    expect(
      titleLink.querySelector('.visually-hidden')
    ).toHaveTextContent('Unpublished')
  })

  it('keeps a compact draft row’s badge in the title', () => {
    const row = renderRow(
      { ...projectFixtureBand, isPublished: false },
      false
    )

    expect(row.querySelector('a mark')).toHaveTextContent(
      'Unpublished'
    )
  })
})
