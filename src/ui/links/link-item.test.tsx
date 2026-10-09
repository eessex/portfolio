import { render } from '@testing-library/react'

import { pressLinkFixture } from '@/lib/links/fixtures'
import { LinkItem } from '@/ui/links/link-item'
import { formattedDateTime } from '@/ui/util'

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

    it('shows the attribution before the date, undashed', () => {
      const { container } = render(<LinkItem link={link} />)

      expect(container.querySelector('b + div')).toHaveTextContent(
        `Test Attribution, ${date}`,
        { normalizeWhitespace: true }
      )
      expect(container).not.toHaveTextContent('—')
    })

    // regression: rendered a stray ", " before the date
    it('shows just the date without an attribution', () => {
      const { container } = render(
        <LinkItem link={{ ...link, attribution: undefined }} />
      )

      expect(container.querySelector('b + div')?.textContent).toBe(
        date
      )
    })
  })
})
