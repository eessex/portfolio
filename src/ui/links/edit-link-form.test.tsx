import {
  act,
  fireEvent,
  render,
  screen,
  waitFor
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { findSocialLink } from '@/lib/links/actions'
import { linkFixture, newLinkFixture } from '@/lib/links/fixtures'
import type { Link } from '@/lib/links/schemas/db'
import { NamePrefixProvider } from '@/ui/item-picker/name-prefix'
import { EditLink } from '@/ui/links/edit-link-form'

jest.mock('@/lib/links/actions', () => ({
  findSocialLink: jest.fn()
}))
const mockFindSocialLink = jest.mocked(findSocialLink)

function renderComponent(props = {}, namePrefix = '') {
  return render(
    <NamePrefixProvider prefix={namePrefix}>
      <EditLink link={newLinkFixture} {...props} />
    </NamePrefixProvider>
  )
}

const urlRegex = /url/i
const titleRegex = /display text/i
const typeRegex = /type/i

describe('EditLink', () => {
  describe('initial render', () => {
    it('renders URL, title and type inputs', () => {
      renderComponent()

      expect(screen.getByLabelText(urlRegex)).toBeInTheDocument()
      expect(screen.getByLabelText(urlRegex)).toHaveAttribute(
        'name',
        'url'
      )
      expect(screen.getByLabelText(titleRegex)).toBeInTheDocument()
      expect(screen.getByLabelText(titleRegex)).toHaveAttribute(
        'name',
        'title'
      )
      expect(screen.getByLabelText(typeRegex)).toBeInTheDocument()
      expect(screen.getByLabelText(typeRegex)).toHaveAttribute(
        'name',
        'type'
      )
    })

    it("namespaces its inputs under a picker slot's prefix", () => {
      renderComponent({ link: linkFixture }, 'links[2].')

      expect(screen.getByLabelText(urlRegex)).toHaveAttribute(
        'name',
        'links[2].url'
      )
      expect(screen.getByLabelText(titleRegex)).toHaveAttribute(
        'name',
        'links[2].title'
      )
      expect(screen.getByLabelText(typeRegex)).toHaveAttribute(
        'name',
        'links[2].type'
      )
    })
  })

  describe('default values', () => {
    it('sets defaultValue for each input from the link prop', () => {
      renderComponent({ link: linkFixture })

      expect(screen.getByLabelText(urlRegex)).toHaveValue(
        'https://testlink.com'
      )

      expect(screen.getByLabelText(titleRegex)).toHaveValue(
        'Test Link'
      )

      expect(screen.getByLabelText(typeRegex)).toHaveValue('')
    })

    it('handles partial link data without errors', () => {
      renderComponent({ link: { url: 'https://testlink.com' } })

      expect(screen.getByLabelText(urlRegex)).toHaveValue(
        'https://testlink.com'
      )
      expect(screen.getByLabelText(titleRegex)).toHaveValue('')
      expect(screen.getByLabelText(typeRegex)).toHaveValue('')
    })
  })

  describe('error display', () => {
    it('handles errors passed via the errors prop', () => {
      const errors = { url: ['URL is required'] }
      renderComponent({ errors })

      const input = screen.getByLabelText(urlRegex)
      const error = screen.getByText(/url is required/i)
      expect(error).toBeInTheDocument()

      const describedBy = input.getAttribute('aria-describedby')
      expect(describedBy).toBeTruthy()

      const ids = describedBy!.split(' ')
      expect(ids).toContain(error.id)
    })

    it('handles multiple errors per field', () => {
      const errors = {
        url: ['URL is required', 'URL must be under 255 characters']
      }
      renderComponent({ errors })

      expect(screen.getByText(/url is required/i)).toBeInTheDocument()
      expect(
        screen.getByText(/url must be under 255 characters/i)
      ).toBeInTheDocument()
    })
  })

  describe('input attributes', () => {
    it('applies attributes correctly', () => {
      renderComponent()

      const urlInput = screen.getByLabelText(urlRegex)
      expect(urlInput).toHaveAttribute('maxlength', '255')
      expect(urlInput).toHaveAttribute(
        'placeholder',
        'https://example.com'
      )
      expect(urlInput).toHaveAttribute('type', 'url')
      expect(urlInput).toBeRequired()

      const titleInput = screen.getByLabelText(titleRegex)
      expect(titleInput).toHaveAttribute('maxlength', '255')
      expect(titleInput).toHaveAttribute('placeholder', 'Title')

      const typeInput = screen.getByLabelText(typeRegex)
      expect(typeInput).toHaveAttribute('aria-expanded', 'false')

      const controlsId = typeInput.getAttribute('aria-controls')
      expect(controlsId).toBeTruthy()

      const fieldset = document.getElementById(controlsId!)
      expect(fieldset).toHaveAttribute('hidden')
    })
  })

  describe('conditional press link fields', () => {
    it('renders press link fields when type is "press"', () => {
      renderComponent({
        link: {
          ...linkFixture,
          type: 'press'
        }
      })

      const select = screen.getByRole('combobox', { name: /type/i })
      expect(select).toHaveValue('press')
      expect(select).toHaveAttribute('aria-expanded', 'true')

      const controlsId = select.getAttribute('aria-controls')
      const fieldset = document.getElementById(controlsId!)
      expect(fieldset).not.toHaveAttribute('hidden')

      expect(
        screen.getByLabelText(/attribution/i)
      ).toBeInTheDocument()
      expect(screen.getByLabelText(/quotation/i)).toBeInTheDocument()
      expect(
        screen.getByLabelText(/publish date/i)
      ).toBeInTheDocument()
    })

    it('does not render press link fields when type is not "press"', () => {
      renderComponent({
        link: {
          ...linkFixture,
          type: 'social'
        }
      })

      const controlsId = screen
        .getByLabelText(typeRegex)
        .getAttribute('aria-controls')
      const fieldset = document.getElementById(controlsId!)
      expect(fieldset).toHaveAttribute('hidden')
    })

    it('reveals press link fields when type is changed to "press"', async () => {
      renderComponent({ link: linkFixture })
      const select = screen.getByRole('combobox', { name: /type/i })
      await userEvent.selectOptions(select, 'press')

      expect(select).toHaveValue('press')
      expect(select).toHaveAttribute('aria-expanded', 'true')

      const controlsId = select.getAttribute('aria-controls')
      const fieldset = document.getElementById(controlsId!)
      expect(fieldset).not.toHaveAttribute('hidden')
    })
  })

  describe('progressive disclosure', () => {
    it('hides secondary fields until the url is filled', () => {
      renderComponent({ link: undefined })

      expect(screen.getByLabelText(titleRegex)).not.toBeVisible()
      expect(screen.getByLabelText(typeRegex)).not.toBeVisible()
    })

    it('shows secondary fields immediately when editing an existing link', () => {
      renderComponent({ link: linkFixture })

      expect(screen.getByLabelText(titleRegex)).toBeVisible()
      expect(screen.getByLabelText(typeRegex)).toBeVisible()
    })

    it('wires aria-expanded/aria-controls on the url input to the details fieldset', () => {
      renderComponent({ link: undefined })

      const urlInput = screen.getByLabelText(urlRegex)
      expect(urlInput).toHaveAttribute('aria-expanded', 'false')

      const controlsId = urlInput.getAttribute('aria-controls')
      expect(controlsId).toBeTruthy()

      const fieldset = document.getElementById(controlsId!)
      expect(fieldset).toHaveAttribute('hidden')
      expect(fieldset).toContainElement(
        screen.getByLabelText(titleRegex)
      )
    })

    it('does not reveal secondary fields while typing one character at a time, only on blur', () => {
      renderComponent({ link: undefined })
      const urlInput = screen.getByLabelText(urlRegex)

      const url = 'https://example.com'
      for (let i = 1; i <= url.length; i++) {
        fireEvent.change(urlInput, {
          target: { value: url.slice(0, i) }
        })
      }
      expect(screen.getByLabelText(titleRegex)).not.toBeVisible()

      fireEvent.blur(urlInput)
      expect(screen.getByLabelText(titleRegex)).toBeVisible()
      expect(urlInput).toHaveAttribute('aria-expanded', 'true')
    })

    it('keeps secondary fields hidden when the url is invalid on blur', () => {
      renderComponent({ link: undefined })
      const urlInput = screen.getByLabelText(urlRegex)

      fireEvent.change(urlInput, { target: { value: 'not a url' } })
      fireEvent.blur(urlInput)

      expect(screen.getByLabelText(titleRegex)).not.toBeVisible()
    })

    it('reveals secondary fields immediately when the url changes by more than one character at once (paste, autocomplete, or autofill)', () => {
      renderComponent({ link: undefined })
      const urlInput = screen.getByLabelText(urlRegex)

      fireEvent.change(urlInput, {
        target: { value: 'https://example.com' }
      })

      expect(screen.getByLabelText(titleRegex)).toBeVisible()
      expect(urlInput).toHaveAttribute('aria-expanded', 'true')
    })

    it('reveals secondary fields immediately for a same-length paste the delta check alone would miss', () => {
      renderComponent({ link: undefined })
      const urlInput = screen.getByLabelText(urlRegex)
      const pastedUrl = 'https://newlink1.com'

      // Build up a same-length baseline one keystroke at a time, the
      // way a user would before selecting-all and pasting a
      // replacement of matching length (delta 0) — the length-delta
      // heuristic alone can't tell this apart from normal typing, so
      // this only reveals via the inputType check.
      for (let i = 1; i <= pastedUrl.length; i++) {
        fireEvent.change(urlInput, {
          target: { value: 'a'.repeat(i) }
        })
      }
      expect(screen.getByLabelText(titleRegex)).not.toBeVisible()

      const nativeSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value'
      )!.set!
      nativeSetter.call(urlInput, pastedUrl)
      fireEvent(
        urlInput,
        new InputEvent('input', {
          inputType: 'insertFromPaste',
          bubbles: true
        })
      )

      expect(screen.getByLabelText(titleRegex)).toBeVisible()
      expect(urlInput).toHaveAttribute('aria-expanded', 'true')
    })

    describe('Enter on a typed url', () => {
      function type(urlInput: HTMLElement, url: string) {
        for (let i = 1; i <= url.length; i++) {
          fireEvent.change(urlInput, {
            target: { value: url.slice(0, i) }
          })
        }
      }

      it('reveals the form instead of submitting', () => {
        renderComponent({ link: undefined })
        const urlInput = screen.getByLabelText(urlRegex)
        type(urlInput, 'https://a.co')
        expect(screen.getByLabelText(titleRegex)).not.toBeVisible()

        const isNotPrevented = fireEvent.keyDown(urlInput, {
          key: 'Enter'
        })

        expect(isNotPrevented).toBe(false)
        expect(screen.getByLabelText(titleRegex)).toBeVisible()
      })

      it('submits once the form is revealed for that url', () => {
        renderComponent({ link: undefined })
        const urlInput = screen.getByLabelText(urlRegex)
        type(urlInput, 'https://a.co')
        fireEvent.keyDown(urlInput, { key: 'Enter' })

        expect(fireEvent.keyDown(urlInput, { key: 'Enter' })).toBe(
          true
        )
      })

      it('submits as usual for an invalid url', () => {
        renderComponent({ link: undefined })
        const urlInput = screen.getByLabelText(urlRegex)
        type(urlInput, 'nope')

        expect(fireEvent.keyDown(urlInput, { key: 'Enter' })).toBe(
          true
        )
        expect(screen.getByLabelText(titleRegex)).not.toBeVisible()
      })

      it('fills a social link’s name', () => {
        renderComponent({ link: undefined, isSocial: true })
        const urlInput = screen.getByLabelText(urlRegex)
        type(urlInput, 'https://youtu.be/a')

        fireEvent.keyDown(urlInput, { key: 'Enter' })

        expect(screen.getByLabelText(/^name/i)).toHaveValue('YouTube')
      })
    })

    it('does not reveal secondary fields when a bulk-inserted value is invalid', () => {
      renderComponent({ link: undefined })
      const urlInput = screen.getByLabelText(urlRegex)

      fireEvent.change(urlInput, { target: { value: 'not a url' } })

      expect(screen.getByLabelText(titleRegex)).not.toBeVisible()
    })

    it('keeps secondary fields hidden for non-http url schemes', () => {
      renderComponent({ link: undefined })
      const urlInput = screen.getByLabelText(urlRegex)

      // native validation accepts this, but we want to reject non-http(s) schemes
      fireEvent.change(urlInput, {
        target: {
          value:
            'transform: translate(20%, -20%); border-radius: 50%;'
        }
      })
      expect(screen.getByLabelText(titleRegex)).not.toBeVisible()

      fireEvent.blur(urlInput)
      expect(screen.getByLabelText(titleRegex)).not.toBeVisible()
      expect(urlInput).toHaveAttribute('aria-expanded', 'false')
    })

    it('keeps secondary fields hidden for an http url', () => {
      renderComponent({ link: undefined })
      const urlInput = screen.getByLabelText(urlRegex)

      fireEvent.change(urlInput, {
        target: { value: 'http://example.com' }
      })
      fireEvent.blur(urlInput)

      expect(screen.getByLabelText(titleRegex)).not.toBeVisible()
      expect(urlInput).toHaveAttribute(
        'pattern',
        '[Hh][Tt][Tt][Pp][Ss]://.+'
      )
    })

    it('re-hides secondary fields without clearing their values when the url is cleared', () => {
      renderComponent({ link: linkFixture })
      const urlInput = screen.getByLabelText(urlRegex)
      const titleInput = screen.getByLabelText(titleRegex)

      fireEvent.change(titleInput, {
        target: { value: 'Updated title' }
      })
      fireEvent.change(urlInput, { target: { value: '' } })
      fireEvent.blur(urlInput)

      expect(titleInput).not.toBeVisible()
      expect(titleInput).toHaveValue('Updated title')
    })
  })

  describe('isSocial', () => {
    it('shows just the url and a name, hiding type and press fields', () => {
      renderComponent({ link: linkFixture, isSocial: true })

      expect(screen.getByLabelText(/^name/i)).toHaveAttribute(
        'name',
        'title'
      )
      expect(
        screen.queryByLabelText(typeRegex)
      ).not.toBeInTheDocument()
      expect(
        screen.queryByLabelText(/attribution/i)
      ).not.toBeInTheDocument()
      expect(
        screen.queryByLabelText(/quotation/i)
      ).not.toBeInTheDocument()
    })

    it('requires the name once the url is filled', () => {
      renderComponent({ link: undefined, isSocial: true })
      const nameInput = screen.getByLabelText(/^name/i)
      expect(nameInput).not.toBeRequired()

      fireEvent.change(screen.getByLabelText(urlRegex), {
        target: { value: 'https://instagram.com/me' }
      })

      expect(nameInput).toBeRequired()
    })

    describe('name from the url', () => {
      function paste(value: string) {
        fireEvent.change(screen.getByLabelText(urlRegex), {
          target: { value }
        })
      }

      it.each([
        ['https://artist.bandcamp.com', 'Bandcamp'],
        ['https://www.youtube.com/@artist', 'YouTube'],
        ['https://youtu.be/abc', 'YouTube'],
        ['https://soundcloud.com/artist', 'Soundcloud']
      ])('names %s %s', (url, name) => {
        renderComponent({ link: undefined, isSocial: true })

        paste(url)

        expect(screen.getByLabelText(/^name/i)).toHaveValue(name)
      })

      it('leaves the name blank for an unsupported host', () => {
        renderComponent({ link: undefined, isSocial: true })

        paste('https://instagram.com/me')

        expect(screen.getByLabelText(/^name/i)).toHaveValue('')
      })

      it('follows the url while the name is still auto-filled', () => {
        renderComponent({ link: undefined, isSocial: true })

        paste('https://artist.bandcamp.com')
        paste('https://vimeo.com/artist')
        expect(screen.getByLabelText(/^name/i)).toHaveValue('Vimeo')

        // a different length, so it reads as a paste
        paste('https://instagram.com/artist')
        expect(screen.getByLabelText(/^name/i)).toHaveValue('')
      })

      it('clears an auto-filled name with the url', () => {
        renderComponent({ link: undefined, isSocial: true })

        paste('https://artist.bandcamp.com')
        paste('')

        expect(screen.getByLabelText(/^name/i)).toHaveValue('')
      })

      it('clears a typed name with the url', () => {
        renderComponent({ link: undefined, isSocial: true })
        paste('https://instagram.com/me')
        fireEvent.change(screen.getByLabelText(/^name/i), {
          target: { value: 'Store' }
        })

        paste('')

        expect(screen.getByLabelText(/^name/i)).toHaveValue('')
      })

      it('keeps a typed name', () => {
        renderComponent({ link: undefined, isSocial: true })
        paste('https://artist.bandcamp.com')
        fireEvent.change(screen.getByLabelText(/^name/i), {
          target: { value: 'My label' }
        })

        paste('https://www.youtube.com/@artist')

        expect(screen.getByLabelText(/^name/i)).toHaveValue(
          'My label'
        )
      })

      it('keeps an existing link’s name', () => {
        renderComponent({
          link: { ...linkFixture, title: 'Shop' },
          isSocial: true
        })

        paste('https://artist.bandcamp.com')

        expect(screen.getByLabelText(/^name/i)).toHaveValue('Shop')
      })

      it('only names social links', () => {
        renderComponent({ link: undefined })

        paste('https://artist.bandcamp.com')

        expect(screen.getByLabelText(/display text/i)).toHaveValue('')
      })
    })
  })

  describe('onExistingMatch', () => {
    const match: Link = {
      ...linkFixture,
      type: 'social',
      url: 'https://artist.bandcamp.com',
      title: 'Bandcamp'
    }

    beforeEach(() => mockFindSocialLink.mockReset())

    function paste(value: string) {
      fireEvent.change(screen.getByLabelText(urlRegex), {
        target: { value }
      })
    }

    it('calls onExistingMatch when a pasted url is already saved', async () => {
      mockFindSocialLink.mockResolvedValue(match)
      const onExistingMatch = jest.fn()
      const onBusyChange = jest.fn()
      renderComponent({
        link: undefined,
        onExistingMatch,
        onBusyChange
      })

      paste(match.url)

      await waitFor(() =>
        expect(onExistingMatch).toHaveBeenCalledWith(match)
      )
      // only a link named for its host can match
      expect(mockFindSocialLink).toHaveBeenCalledWith(
        match.url,
        'Bandcamp'
      )
      expect(onBusyChange).toHaveBeenCalledWith(true)
      expect(onBusyChange).toHaveBeenLastCalledWith(false)
    })

    it('does nothing on no match', async () => {
      mockFindSocialLink.mockResolvedValue(undefined)
      const onExistingMatch = jest.fn()
      const onBusyChange = jest.fn()
      renderComponent({
        link: undefined,
        onExistingMatch,
        onBusyChange
      })

      paste('https://new.bandcamp.com')

      await waitFor(() =>
        expect(onBusyChange).toHaveBeenLastCalledWith(false)
      )
      expect(onExistingMatch).not.toHaveBeenCalled()
    })

    it('looks up a typed url on Enter', async () => {
      mockFindSocialLink.mockResolvedValue(match)
      const onExistingMatch = jest.fn()
      renderComponent({ link: undefined, onExistingMatch })
      const urlInput = screen.getByLabelText(urlRegex)
      for (let i = 1; i <= match.url.length; i++) {
        fireEvent.change(urlInput, {
          target: { value: match.url.slice(0, i) }
        })
      }
      expect(mockFindSocialLink).not.toHaveBeenCalled()

      fireEvent.keyDown(urlInput, { key: 'Enter' })

      await waitFor(() =>
        expect(onExistingMatch).toHaveBeenCalledWith(match)
      )
    })

    it('stays collapsed while looking up, and on a match', async () => {
      let resolveLookup: (link: Link | undefined) => void = () => {}
      mockFindSocialLink.mockImplementationOnce(
        () => new Promise((resolve) => (resolveLookup = resolve))
      )
      const onExistingMatch = jest.fn()
      renderComponent({ link: undefined, onExistingMatch })
      const urlInput = screen.getByLabelText(urlRegex)

      paste(match.url)
      fireEvent.blur(urlInput)
      expect(urlInput).toHaveAttribute('aria-expanded', 'false')

      resolveLookup(match)
      await waitFor(() =>
        expect(onExistingMatch).toHaveBeenCalledWith(match)
      )
      expect(urlInput).toHaveAttribute('aria-expanded', 'false')
    })

    it('expands once the lookup finds no match', async () => {
      mockFindSocialLink.mockResolvedValue(undefined)
      renderComponent({ link: undefined, onExistingMatch: jest.fn() })
      const urlInput = screen.getByLabelText(urlRegex)

      paste('https://new.bandcamp.com')

      await waitFor(() =>
        expect(urlInput).toHaveAttribute('aria-expanded', 'true')
      )
    })

    it('ignores a stale response once the url has changed', async () => {
      let resolveFirst: (link: Link | undefined) => void = () => {}
      mockFindSocialLink
        .mockImplementationOnce(
          () => new Promise((resolve) => (resolveFirst = resolve))
        )
        .mockResolvedValueOnce(undefined)
      const onExistingMatch = jest.fn()
      renderComponent({ link: undefined, onExistingMatch })

      paste(match.url)
      paste('https://example.com/other')
      await act(async () => resolveFirst(match))

      expect(onExistingMatch).not.toHaveBeenCalled()
    })

    it('keeps the draft when its name was changed while looking up', async () => {
      let resolveLookup: (link: Link | undefined) => void = () => {}
      mockFindSocialLink.mockImplementationOnce(
        () => new Promise((resolve) => (resolveLookup = resolve))
      )
      const onExistingMatch = jest.fn()
      renderComponent({
        link: undefined,
        isSocial: true,
        onExistingMatch
      })

      paste(match.url)
      fireEvent.change(screen.getByLabelText(/^name/i), {
        target: { value: 'Store' }
      })
      await act(async () => resolveLookup(match))

      expect(onExistingMatch).not.toHaveBeenCalled()
      expect(screen.getByLabelText(/^name/i)).toBeVisible()
    })

    it('ignores a pending lookup once a character is typed', async () => {
      let resolveFirst: (link: Link | undefined) => void = () => {}
      mockFindSocialLink.mockImplementationOnce(
        () => new Promise((resolve) => (resolveFirst = resolve))
      )
      const onExistingMatch = jest.fn()
      const onBusyChange = jest.fn()
      renderComponent({
        link: undefined,
        onExistingMatch,
        onBusyChange
      })

      paste(match.url)
      fireEvent.change(screen.getByLabelText(urlRegex), {
        target: { value: `${match.url}x` }
      })
      expect(onBusyChange).toHaveBeenLastCalledWith(false)
      await act(async () => resolveFirst(match))

      expect(onExistingMatch).not.toHaveBeenCalled()
    })

    it('skips the lookup for a host with no inferred name, expanding at once', () => {
      const onBusyChange = jest.fn()
      renderComponent({
        link: undefined,
        onExistingMatch: jest.fn(),
        onBusyChange
      })

      paste('https://instagram.com/me')

      expect(mockFindSocialLink).not.toHaveBeenCalled()
      expect(onBusyChange).not.toHaveBeenCalledWith(true)
      expect(screen.getByLabelText(urlRegex)).toHaveAttribute(
        'aria-expanded',
        'true'
      )
    })

    it('skips the lookup for an invalid url', () => {
      renderComponent({ link: undefined, onExistingMatch: jest.fn() })

      paste('not a url')

      expect(mockFindSocialLink).not.toHaveBeenCalled()
    })

    it('does not look up again on blur for the same url', async () => {
      mockFindSocialLink.mockResolvedValue(undefined)
      renderComponent({ link: undefined, onExistingMatch: jest.fn() })

      paste('https://new.bandcamp.com')
      fireEvent.blur(screen.getByLabelText(urlRegex))

      await waitFor(() =>
        expect(mockFindSocialLink).toHaveBeenCalledTimes(1)
      )
    })

    it('makes no lookup without onExistingMatch', () => {
      renderComponent({ link: undefined })

      paste('https://new.bandcamp.com')

      expect(mockFindSocialLink).not.toHaveBeenCalled()
    })
  })
})
