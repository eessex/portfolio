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
})
