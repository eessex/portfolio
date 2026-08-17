import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { linkFixture, newLinkFixture } from '@/lib/links/fixtures'
import { EditLink } from '@/ui/links/edit-link-form'

function renderComponent(props = {}) {
  return render(<EditLink link={newLinkFixture} {...props} />)
}

const urlRegex = /url/i
const titleRegex = /title/i
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

    it('applies prefix to input names correctly if index is provided', () => {
      renderComponent({
        link: linkFixture,
        index: 2
      })

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

    it('does not reveal secondary fields when a bulk-inserted value is invalid', () => {
      renderComponent({ link: undefined })
      const urlInput = screen.getByLabelText(urlRegex)

      fireEvent.change(urlInput, { target: { value: 'not a url' } })

      expect(screen.getByLabelText(titleRegex)).not.toBeVisible()
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
})
