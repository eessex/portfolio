import {
  fireEvent,
  render,
  screen,
  waitFor
} from '@testing-library/react'

import { embedCodeFixture } from '@/lib/embed-codes/fixtures'
import { EditEmbedCode } from '@/ui/embed-codes/edit-embed-code-form'
import {
  embedCodeSoundcloud,
  embedCodeYoutubeFixture
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

function renderComponent(props = {}) {
  return render(<EditEmbedCode embedCode={undefined} {...props} />)
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
      expect(screen.getByLabelText(iframeRegex)).toHaveAttribute(
        'name',
        'iframe'
      )
      expect(screen.getByLabelText(titleRegex)).toBeInTheDocument()
      expect(screen.getByLabelText(titleRegex)).toHaveAttribute(
        'name',
        'title'
      )
      expect(screen.getByLabelText(captionRegex)).toBeInTheDocument()
      expect(screen.getByLabelText(captionRegex)).toHaveAttribute(
        'name',
        'caption'
      )
      expect(screen.getByLabelText(typeRegex)).toBeInTheDocument()
      expect(screen.getByLabelText(typeRegex)).toHaveAttribute(
        'name',
        'type'
      )
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

      expect(screen.getByLabelText(iframeRegex)).toHaveAttribute(
        'name',
        'embedCodes[2].iframe'
      )
      expect(screen.getByLabelText(titleRegex)).toHaveAttribute(
        'name',
        'embedCodes[2].title'
      )
      expect(screen.getByLabelText(captionRegex)).toHaveAttribute(
        'name',
        'embedCodes[2].caption'
      )
      expect(screen.getByLabelText(typeRegex)).toHaveAttribute(
        'name',
        'embedCodes[2].type'
      )
    })
  })

  describe('default values', () => {
    it('sets defaultValue for each input from the embedCode prop', () => {
      renderComponent({
        embedCode: {
          src: embedCodeSoundcloud.src,
          caption: 'This is an embed code for testing purposes.',
          title: 'Artist Name - Song Name',
          type: 'audio'
        }
      })
      const input = document.querySelector('input[name="src"]')
      expect(input).toHaveValue(embedCodeSoundcloud.src)

      expect(screen.getByLabelText(titleRegex)).toHaveValue(
        'Artist Name - Song Name'
      )

      expect(screen.getByLabelText(captionRegex)).toHaveValue(
        'This is an embed code for testing purposes.'
      )

      expect(screen.getByLabelText(typeRegex)).toHaveValue('audio')
    })

    it('auto-populates src, host and type from iframe ', async () => {
      renderComponent()
      const input = document.querySelector('input[name="iframe"]')

      expect(input).toBeInTheDocument()
      fireEvent.change(input!, {
        target: { value: embedCodeYoutubeFixture }
      })
      await waitFor(() => {
        expect(
          screen.getByDisplayValue(embedCodeFixture.src)
        ).toBeInTheDocument()
        expect(
          screen.getByDisplayValue(embedCodeFixture.host)
        ).toBeInTheDocument()
        const option = screen.getByRole('option', {
          name: /video/i
        }) as HTMLOptionElement
        expect(option.selected).toBe(true)
        expect(
          document.querySelector('input[name="iframe"]')
        ).not.toBeInTheDocument()
      })
      expect(screen.getByLabelText(captionRegex)).toHaveValue('')
    })
  })

  describe('error display', () => {
    it('handles invalid iframe input with toast message', () => {
      renderComponent()
      const iframeInput = screen.getByLabelText(
        iframeRegex
      ) as HTMLInputElement
      fireEvent.change(iframeInput, {
        target: { value: 'invalid iframe code' }
      })

      expect(mockAddError).toHaveBeenCalledWith(
        'Error parsing iframe.'
      )
    })
  })

  describe('input attributes', () => {
    it('applies attributes correctly', () => {
      renderComponent()

      const iframeInput = screen.getByLabelText(iframeRegex)
      expect(iframeInput).toHaveAttribute('maxlength', '1500')
      expect(iframeInput).toHaveAttribute(
        'placeholder',
        '<iframe></iframe>'
      )
      expect(iframeInput).toHaveAttribute('type', 'text')
      expect(iframeInput).toBeRequired()

      const titleInput = screen.getByLabelText(titleRegex)
      expect(titleInput).toHaveAttribute('maxlength', '255')
      expect(titleInput).toHaveAttribute(
        'placeholder',
        'Music video for Artist Name - Song Name'
      )

      const captionInput = screen.getByLabelText(captionRegex)
      expect(captionInput).toHaveAttribute('maxlength', '255')
      expect(captionInput).toHaveAttribute(
        'placeholder',
        'Video by Artist Name (2024)'
      )
    })
  })
})
