import { render } from '@testing-library/react'

import { pressLinkFixture } from '@/lib/links/fixtures'
import { formattedDateTime } from '@/ui/format/dates'
import { LinkItem } from '@/ui/links/link-item'

const publishDate = new Date('2024-03-15T12:00:00Z')
const date = formattedDateTime(publishDate, 'xs')
const pressLink = { ...pressLinkFixture, publishDate }

describe('LinkItem', () => {
  describe('press link with a quotation', () => {
    it('dashes the title and attribution before the date', () => {
      const { container } = render(<LinkItem link={pressLink} />)

      expect(container.querySelector('cite')).toHaveTextContent(
        `— Test Press Link in Test Attribution, ${date}`
      )
    })
  })

  describe('press link without a quotation', () => {
    const link = { ...pressLink, quotation: undefined }

    it('renders publication, title and date cells', () => {
      const { container } = render(<LinkItem link={link} />)

      const cells = container.querySelectorAll('a > *')
      expect([...cells].map((cell) => cell.textContent)).toEqual([
        'Test Attribution',
        'Test Press Link',
        `${date} `
      ])
      expect(cells[2]?.querySelector('svg')).toBeInTheDocument()
    })

    it('falls back to the url without a title', () => {
      const { container } = render(
        <LinkItem link={{ ...link, title: undefined }} />
      )

      expect(container.querySelector('a > span')).toHaveTextContent(
        link.url
      )
    })
  })
})
