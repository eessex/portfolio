import {
  fireEvent,
  render,
  screen,
  waitFor
} from '@testing-library/react'

import { embedCodeFixture } from '@/lib/embed-codes/fixtures'
import { EditEmbedCode } from '@/ui/embed-codes/edit-embed-code-form'
import {
  embedCodeBandcampFixtureMedium,
  embedCodeSoundcloudFixture
} from '@/ui/embed-codes/fixtures'
import { useToast } from '@/ui/toast/toast-context'

jest.mock('@/ui/toast/toast-context', () => {
  return { useToast: jest.fn() }
})
const mockAddError = jest.fn()
const mockAddSuccess = jest.fn()
;(useToast as jest.Mock).mockReturnValue({
  addErrorMessage: mockAddError,
  addSuccessMessage: mockAddSuccess,
  removeMessage: jest.fn()
})

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
const typeRegex = /type/i

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
      expect(screen.getByLabelText(typeRegex)).toBeInTheDocument()
      expect(screen.getByLabelText(typeRegex)).toHaveAttribute('name', 'type')
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
        screen.getByText(/paste a full iframe embed code/i)
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
      expect(screen.getByLabelText(typeRegex)).toHaveAttribute('name', 'embedCodes[2].type')
    })
  })

  describe('default values', () => {
    it('sets defaultValue for each input from the embedCode prop', () => {
      renderComponent({
        embedCode: {
          iframe: embedCodeSoundcloudFixture,
          caption: 'This is an embed code for testing purposes.',
          title: 'Eve Essex - Honeypot'
        }
      })
      const input = document.querySelector('input[name="iframe"]')
      expect(input).toHaveValue(embedCodeSoundcloudFixture)

      expect(screen.getByLabelText(titleRegex))
        .toHaveValue('Eve Essex - Honeypot')

      expect(screen.getByLabelText(captionRegex))
        .toHaveValue('This is an embed code for testing purposes.')

      expect(screen.getByLabelText(typeRegex))
        .toHaveValue('audio')
    })

    it('auto-populates title from iframe if title is not provided in embedCode prop', () => {
      renderComponent({ embedCode: { iframe: embedCodeSoundcloudFixture } })

      expect(screen.getByLabelText(titleRegex))
        .toHaveValue('Soundcloud: Eve Essex - Honeypot')
    })

    it('handles partial embedCode data without errors', async () => {
      renderComponent({ embedCode: { iframe: embedCodeBandcampFixtureMedium } })
      const input = document.querySelector('input[name="iframe"]')

      expect(input).toHaveValue(embedCodeBandcampFixtureMedium)
      await waitFor(() => {
        expect(screen.getByLabelText(titleRegex))
          .toHaveValue('Bandcamp: The Fabulous Truth by Eve Essex')
      })
      expect(screen.getByLabelText(captionRegex)).toHaveValue('')
    })
  })

  describe('error display', () => {
    it('handles invalid iframe input with toast message', () => {
      renderComponent()
      const iframeInput = screen.getByLabelText(iframeRegex) as HTMLInputElement
      fireEvent.change(iframeInput, { target: { value: 'invalid iframe code' } })

      expect(mockAddError).toHaveBeenCalledWith('Error parsing iframe.')
    })

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

  describe('input attributes', () => {
    it('applies attributes correctly', () => {
      renderComponent()

      const iframeInput = screen.getByLabelText(iframeRegex)
      expect(iframeInput).toHaveAttribute('maxlength', '1500')
      expect(iframeInput).toHaveAttribute('placeholder', '<iframe></iframe>')
      expect(iframeInput).toHaveAttribute('type', 'text')
      expect(iframeInput).toBeRequired()

      const titleInput = screen.getByLabelText(titleRegex)
      expect(titleInput).toHaveAttribute('maxlength', '255')
      expect(titleInput).toHaveAttribute('placeholder', 'Hostname: descriptive title')

      const captionInput = screen.getByLabelText(captionRegex)
      expect(captionInput).toHaveAttribute('maxlength', '255')
      expect(captionInput).toHaveAttribute('placeholder', 'Video by Artist Name (2024)')
    })
  })
})
