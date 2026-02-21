import {
  render,
  screen
} from '@testing-library/react'

import {
  embedCodeFixture,
  newEmbedCodeFixture
} from '@/lib/embed-codes/fixtures'
import { EditEmbedCode } from '@/ui/embed-codes/edit-embed-code-form'

function renderComponent (props = {}) {
  return render(
    <EditEmbedCode
      embedCode={undefined}
      {...props}
    />
  )
}

const iframeRegex = /iframe/i
const titleRegex = /title/i
const captionRegex = /caption/i

describe('EditEmbedCode', () => {
  describe('initial render', () => {
    it('renders iframe, title and caption inputs', () => {
      renderComponent()

      expect(screen.getByLabelText(iframeRegex)).toBeInTheDocument()
      expect(screen.getByLabelText(iframeRegex)).toHaveAttribute('name', 'iframe')
      expect(screen.getByLabelText(titleRegex)).toBeInTheDocument()
      expect(screen.getByLabelText(titleRegex)).toHaveAttribute('name', 'title')
      expect(screen.getByLabelText(captionRegex)).toBeInTheDocument()
      expect(screen.getByLabelText(captionRegex)).toHaveAttribute('name', 'caption')
    })

    it('renders hidden ID input if embedCode.id is provided', () => {
      renderComponent({ embedCode: embedCodeFixture })
      const idInput = screen.getByDisplayValue(embedCodeFixture.id)

      expect(idInput).toBeInTheDocument()
      expect(idInput).toHaveAttribute('type', 'hidden')
      expect(idInput).toHaveAttribute('name', 'id')
      expect(screen.queryByLabelText(/embed code id/i)).not.toBeInTheDocument()
    })

    it('renders description for iframe, caption and title inputs', () => {
      renderComponent()
      expect(
        screen.getByText(/paste the full iframe embed code/i)
      ).toBeInTheDocument()
      expect(
        screen.getByText(/displayed below the iframe/i)
      ).toBeInTheDocument()
      expect(
        screen.getByText(/displayed below the iframe/i)
      ).toBeInTheDocument()
    })

    it('applies prefix to input names correctly if index is provided', () => {
      renderComponent({
        embedCode: {},
        index: 2
      })

      expect(screen.getByLabelText(iframeRegex)).toHaveAttribute('name', 'embedCodes[2].iframe')
      expect(screen.getByLabelText(titleRegex)).toHaveAttribute('name', 'embedCodes[2].title')
      expect(screen.getByLabelText(captionRegex)).toHaveAttribute('name', 'embedCodes[2].caption')
    })
  })

  describe('default values', () => {
    it('sets defaultValue for each input from the embedCode prop', () => {
      renderComponent({ embedCode: embedCodeFixture })

      expect(screen.getByLabelText(iframeRegex))
        .toHaveValue('<iframe src="https://example.com/embed"></iframe>')

      expect(screen.getByLabelText(titleRegex))
        .toHaveValue('Test Embed Code')

      expect(screen.getByLabelText(captionRegex))
        .toHaveValue('This is an embed code for testing purposes.')
    })

    it('handles partial embedCode data without errors', () => {
      renderComponent({ embedCode: { iframe: embedCodeFixture.iframe } })

      expect(screen.getByLabelText(iframeRegex)).toHaveValue(embedCodeFixture.iframe)
      expect(screen.getByLabelText(titleRegex)).toHaveValue('')
      expect(screen.getByLabelText(captionRegex)).toHaveValue('')
    })
  })

  describe('error display', () => {
    it('handles errors passed via the errors prop', () => {
      const errors = { iframe: ['iframe is required'] }
      renderComponent({ errors })

      const input = screen.getByLabelText(iframeRegex)
      const error = screen.getByText(/iframe is required/i)
      expect(error).toBeInTheDocument()

      const describedBy = input.getAttribute('aria-describedby')
      expect(describedBy).toBeTruthy()

      const ids = describedBy!.split(' ')
      expect(ids).toContain(error.id)
    })

    it('handles multiple errors per field', () => {
      const errors = { iframe: ['iframe is required', 'iframe must be under 255 characters'] }
      renderComponent({ errors })

      expect(screen.getByText(/iframe is required/i)).toBeInTheDocument()
      expect(screen.getByText(/iframe must be under 255 characters/i)).toBeInTheDocument()
    })
  })

  describe.skip('input attributes', () => {
    it('applies attributes correctly', () => {
      renderComponent()

      const iframeInput = screen.getByLabelText(iframeRegex)
      expect(iframeInput).toHaveAttribute('maxlength', '255')
      expect(iframeInput).toHaveAttribute('placeholder', 'https://example.com')
      expect(iframeInput).toHaveAttribute('type', 'iframe')
      expect(iframeInput).toBeRequired()

      const titleInput = screen.getByLabelText(titleRegex)
      expect(titleInput).toHaveAttribute('maxlength', '255')
      expect(titleInput).toHaveAttribute('placeholder', 'Title')

      const typeInput = screen.getByLabelText(captionRegex)
      expect(typeInput).toHaveAttribute('aria-expanded', 'false')

      const controlsId = typeInput.getAttribute('aria-controls')
      expect(controlsId).toBeTruthy()

      const fieldset = document.getElementById(controlsId!)
      expect(fieldset).toHaveAttribute('hidden')
    })
  })
})
