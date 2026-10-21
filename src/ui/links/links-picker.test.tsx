import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { linkFixture, pressLinkFixture } from '@/lib/links/fixtures'
import {
  LinksPicker,
  PressLinksPicker,
  SocialLinksPicker
} from '@/ui/links/links-picker'

jest.mock('@/lib/links/data', () => ({ fetchLinkByUrl: jest.fn() }))

function submittedIds(name: string) {
  return Array.from(
    document.querySelectorAll<HTMLInputElement>(
      `input[name^="${name}["][name$="].id"]`
    )
  )
    .sort(
      (a, b) =>
        Number(a.name.match(/\d+/)?.[0]) -
        Number(b.name.match(/\d+/)?.[0])
    )
    .map((input) => input.value)
}

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
      render(
        <LinksPicker
          links={[linkFixture, { ...linkFixture, id: 'link-2' }]}
        />
      )

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

  it('shows only non-press links, searching non-press links', async () => {
    render(<LinksPicker links={[linkFixture, pressLinkFixture]} />)

    expect(submittedIds('links')).toEqual([linkFixture.id])
    await waitFor(() =>
      expect(fetchMock.mock.calls[0]?.[0]).toContain('isPress=false')
    )
  })

  it('offers no press type for new links', async () => {
    const user = userEvent.setup()
    render(<LinksPicker />)

    const [input] = visibleUrlInputs()
    await user.type(input, 'https://example.com')
    await user.tab()

    expect(
      screen.getByRole('option', { name: /social/i })
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('option', { name: /press/i })
    ).not.toBeInTheDocument()
  })
})

describe('PressLinksPicker', () => {
  beforeEach(() => {
    fetchMock.resetMocks()
    fetchMock.mockResponse(
      JSON.stringify({ res: [], nextCursor: null, totalCount: 0 })
    )
  })

  it('names its New button "New press link"', async () => {
    const user = userEvent.setup()
    render(<PressLinksPicker links={[pressLinkFixture]} />)
    await user.click(
      screen.getByRole('button', { name: /^search press links$/i })
    )

    expect(
      screen.getByRole('button', { name: /^new press link$/i })
    ).toBeInTheDocument()
  })

  it('labels its search toggle "Search press links"', () => {
    render(<PressLinksPicker />)

    expect(
      screen.getByRole('button', { name: /^search press links$/i })
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /search links/i })
    ).not.toBeInTheDocument()
  })

  it('shows only press links under its own field name, searching press links', async () => {
    render(
      <PressLinksPicker links={[linkFixture, pressLinkFixture]} />
    )

    expect(submittedIds('pressLinks')).toEqual([pressLinkFixture.id])
    expect(submittedIds('links')).toEqual([])
    await waitFor(() =>
      expect(fetchMock.mock.calls[0]?.[0]).toContain('isPress=true')
    )
  })

  it('shows the press fields without a type select', async () => {
    const user = userEvent.setup()
    render(<PressLinksPicker />)

    const [input] = visibleUrlInputs()
    await user.type(input, 'https://example.com')
    await user.tab()

    expect(screen.getByLabelText(/attribution/i)).toBeVisible()
    expect(
      document.querySelector('[name$=".type"]')
    ).not.toBeInTheDocument()
  })

  it('requires display text, attribution and publish date once the url is filled', async () => {
    const user = userEvent.setup()
    render(<PressLinksPicker />)

    const required = () =>
      ['title', 'attribution', 'publishDate'].map(
        (field) =>
          document.querySelector<HTMLInputElement>(
            `[name$=".${field}"]`
          )?.required
      )
    expect(required()).toEqual([false, false, false])

    const [input] = visibleUrlInputs()
    await user.type(input, 'https://example.com')
    await user.tab()

    expect(required()).toEqual([true, true, true])
  })

  it('renders display text outside the two-column group', async () => {
    const user = userEvent.setup()
    render(<PressLinksPicker />)

    const [input] = visibleUrlInputs()
    await user.type(input, 'https://example.com')
    await user.tab()

    expect(
      screen.getByLabelText(/display text/i).closest('.input-group')
    ).toBeNull()
  })

  describe('default order', () => {
    const resetButton = () =>
      screen.queryByRole('button', {
        name: /sort press links by date/i
      })

    it('hides the reset button while links are in default order', () => {
      render(<PressLinksPicker links={[pressLinkFixture]} />)

      expect(resetButton()).toBeNull()
    })

    const olderPress = {
      ...pressLinkFixture,
      id: 'press-older',
      publishDate: new Date('2020-01-01')
    }

    it('sorts and drags a new review as press, though it submits no type', async () => {
      const user = userEvent.setup()
      render(<PressLinksPicker links={[olderPress]} />)

      const [input] = visibleUrlInputs()
      await user.type(input, 'https://new-review.com')
      await user.tab()
      await user.type(
        screen.getByLabelText(/display text/i),
        'Review'
      )
      await user.type(screen.getByLabelText(/attribution/i), 'Wire')
      await user.type(
        screen.getByLabelText(/publish date/i),
        '2024-01-01'
      )
      await user.type(screen.getByLabelText(/quotation/i), 'Great')
      await user.click(
        screen.getByRole('button', { name: /save press link/i })
      )

      const indexOf = (value: string) =>
        Number(
          Array.from(
            document.querySelectorAll<HTMLInputElement>(
              'input[name^="pressLinks["]'
            )
          )
            .find((input) => input.value === value)
            ?.name.match(/\d+/)?.[0]
        )
      expect(indexOf('https://new-review.com')).toBeLessThan(
        indexOf(olderPress.id)
      )
      expect(
        screen.getAllByRole('button', { name: /drag to reorder/i })
      ).toHaveLength(2)
    })

    it('offers a reset once a press link is moved out of place', async () => {
      const user = userEvent.setup()
      render(
        <PressLinksPicker
          links={[pressLinkFixture, olderPress, linkFixture]}
        />
      )

      await user.click(
        screen.getAllByRole('button', { name: /move down/i })[0]
      )
      expect(submittedIds('pressLinks')).toEqual([
        olderPress.id,
        pressLinkFixture.id
      ])

      await user.click(resetButton()!)

      expect(submittedIds('pressLinks')).toEqual([
        pressLinkFixture.id,
        olderPress.id
      ])
      expect(resetButton()).toBeNull()
    })
  })
})

describe('SocialLinksPicker', () => {
  const resetButton = () =>
    screen.queryByRole('button', {
      name: /sort social links by name/i
    })
  const bandcamp = {
    ...linkFixture,
    id: 'bandcamp',
    title: 'Bandcamp'
  }
  const youtube = { ...linkFixture, id: 'youtube', title: 'YouTube' }

  it('hides the reset button while links are sorted by name', () => {
    render(<SocialLinksPicker links={[bandcamp, youtube]} />)

    expect(resetButton()).toBeNull()
  })

  it('keeps a stored custom order, offering a reset to name order', async () => {
    const user = userEvent.setup()
    render(<SocialLinksPicker links={[youtube, bandcamp]} />)
    expect(submittedIds('socialLinks')).toEqual([
      'youtube',
      'bandcamp'
    ])

    await user.click(resetButton()!)

    expect(submittedIds('socialLinks')).toEqual([
      'bandcamp',
      'youtube'
    ])
    expect(resetButton()).toBeNull()
  })

  it('offers a reset once a link is moved out of name order', async () => {
    const user = userEvent.setup()
    render(<SocialLinksPicker links={[bandcamp, youtube]} />)

    await user.click(
      screen.getAllByRole('button', { name: /move down/i })[0]!
    )

    expect(submittedIds('socialLinks')).toEqual([
      'youtube',
      'bandcamp'
    ])
    expect(resetButton()).not.toBeNull()
  })
})
