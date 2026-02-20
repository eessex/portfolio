import {
  render,
  screen
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {
  linkFixture,
  newLinkFixture
} from '@/lib/links/fixtures'
import { EditLink } from '@/ui/links/edit-link-form'

function renderComponent (props = {}) {
  return render(
    <EditLink
      link={newLinkFixture}
      {...props}
    />
  )
}

const urlRegex = /url/i
const titleRegex = /title/i
const typeRegex = /type/i

describe('EditLink', () => {
  describe('initial render', () => {
    it('renders URL, title and type inputs', () => {
      renderComponent()

      expect(screen.getByLabelText(urlRegex)).toBeInTheDocument()
      expect(screen.getByLabelText(urlRegex)).toHaveAttribute('name', 'url')
      expect(screen.getByLabelText(titleRegex)).toBeInTheDocument()
      expect(screen.getByLabelText(titleRegex)).toHaveAttribute('name', 'title')
      expect(screen.getByLabelText(typeRegex)).toBeInTheDocument()
      expect(screen.getByLabelText(typeRegex)).toHaveAttribute('name', 'type')
    })

    it('renders hidden ID input if link.id is provided', () => {
      renderComponent({ link: linkFixture })

      const idInput = screen.getByDisplayValue(linkFixture.id)
      expect(idInput).toBeInTheDocument()
      expect(idInput).toHaveAttribute('type', 'hidden')
      expect(idInput).toHaveAttribute('name', 'id')
      expect(screen.queryByLabelText(/link id/i)).not.toBeInTheDocument()
    })

    it('applies prefix to input names correctly if index is provided', () => {
      renderComponent({
        link: linkFixture,
        index: 2
      })

      expect(screen.getByLabelText(urlRegex)).toHaveAttribute('name', 'links[2].url')
      expect(screen.getByLabelText(titleRegex)).toHaveAttribute('name', 'links[2].title')
      expect(screen.getByLabelText(typeRegex)).toHaveAttribute('name', 'links[2].type')
    })
  })

  describe('default values', () => {
    it('sets defaultValue for each input from the link prop', () => {
      renderComponent({ link: linkFixture })

      expect(screen.getByLabelText(urlRegex))
        .toHaveValue('https://testlink.com')

      expect(screen.getByLabelText(titleRegex))
        .toHaveValue('Test Link')

      expect(screen.getByLabelText(typeRegex))
        .toHaveValue('')
    })

    it('handles partial link data without errors', () => {
      renderComponent({ link: { url: 'https://testlink.com' } })

      expect(screen.getByLabelText(urlRegex)).toHaveValue('https://testlink.com')
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
      const errors = { url: ['URL is required', 'URL must be under 255 characters'] }
      renderComponent({ errors })

      expect(screen.getByText(/url is required/i)).toBeInTheDocument()
      expect(screen.getByText(/url must be under 255 characters/i)).toBeInTheDocument()
    })
  })

  describe('input attributes', () => {
    it('applies attributes correctly', () => {
      renderComponent()

      const urlInput = screen.getByLabelText(urlRegex)
      expect(urlInput).toHaveAttribute('maxlength', '255')
      expect(urlInput).toHaveAttribute('placeholder', 'https://example.com')
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

      expect(screen.getByLabelText(/attribution/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/quotation/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/publish date/i)).toBeInTheDocument()
    })

    it('does not render press link fields when type is not "press"', () => {
      renderComponent({
        link: {
          ...linkFixture,
          type: 'social'
        }
      })

      const controlsId = screen.getByLabelText(typeRegex).getAttribute('aria-controls')
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
})
