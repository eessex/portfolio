import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { linkFixture, pressLinkFixture } from '@/lib/links/fixtures'
import { LinksPicker } from '@/ui/links/links-picker'

function visibleUrlInputs() {
  return Array.from(
    document.querySelectorAll<HTMLInputElement>('input[name$=".url"]')
  ).filter((input) => !input.closest('[hidden]'))
}

describe('LinksPicker', () => {
  beforeEach(() => {
    fetchMock.resetMocks()
    fetchMock.mockResponse(
      JSON.stringify({ res: [], nextCursor: null, totalCount: 0 })
    )
  })

  describe('an edited link with an invalid url stays open', () => {
    const closeActions = {
      'editing another link': () =>
        screen.getByRole('button', { name: /^edit$/i }),
      'toggling back to search': () =>
        screen.getByRole('button', { name: /search link/i }),
      'saving it': () =>
        screen.getByRole('button', { name: /save link/i })
    }

    it.each(
      [
        'not a url',
        'example.com',
        'example:com',
        'htps://x.com'
      ].flatMap((value) =>
        Object.keys(closeActions).map((action) => [value, action])
      )
    )('%s, on %s', async (value, action) => {
      const user = userEvent.setup()
      render(<LinksPicker links={[linkFixture, pressLinkFixture]} />)

      await user.click(
        screen.getAllByRole('button', { name: /^edit$/i })[0]
      )
      const [input] = visibleUrlInputs()
      await user.clear(input)
      await user.type(input, value)
      await user.click(
        closeActions[action as keyof typeof closeActions]()
      )

      expect(visibleUrlInputs().map((i) => i.value)).toEqual([value])
    })
  })

  describe('default order', () => {
    function submittedIds() {
      return Array.from(
        document.querySelectorAll<HTMLInputElement>(
          'input[name^="links["][name$="].id"]'
        )
      )
        .sort(
          (a, b) =>
            Number(a.name.match(/\d+/)?.[0]) -
            Number(b.name.match(/\d+/)?.[0])
        )
        .map((input) => input.value)
    }

    const resetButton = () =>
      screen.queryByRole('button', {
        name: /sort press links by date/i
      })

    it('hides the reset button while links are in default order', () => {
      render(<LinksPicker links={[pressLinkFixture, linkFixture]} />)

      expect(resetButton()).toBeNull()
    })

    const olderPress = {
      ...pressLinkFixture,
      id: 'press-older',
      publishDate: new Date('2020-01-01')
    }

    it('offers a reset once a press link is moved out of place', async () => {
      const user = userEvent.setup()
      render(
        <LinksPicker
          links={[pressLinkFixture, olderPress, linkFixture]}
        />
      )

      await user.click(
        screen.getAllByRole('button', { name: /move down/i })[0]
      )
      expect(submittedIds()).toEqual([
        olderPress.id,
        pressLinkFixture.id,
        linkFixture.id
      ])

      await user.click(resetButton()!)

      expect(submittedIds()).toEqual([
        pressLinkFixture.id,
        olderPress.id,
        linkFixture.id
      ])
      expect(resetButton()).toBeNull()
    })

    it('keeps press links above other links, with nothing to drag', () => {
      render(<LinksPicker links={[linkFixture, pressLinkFixture]} />)

      expect(submittedIds()).toEqual([
        pressLinkFixture.id,
        linkFixture.id
      ])
      expect(
        screen.queryByRole('button', { name: /move down/i })
      ).not.toBeInTheDocument()
      expect(
        screen.queryByRole('button', { name: 'Drag to reorder' })
      ).not.toBeInTheDocument()
    })
  })
})
