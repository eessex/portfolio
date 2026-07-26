import { fireEvent, render, screen } from '@testing-library/react'

import { embedCodeFixture } from '@/lib/embed-codes/fixtures'
import { EditEmbedCode } from '@/ui/embed-codes/edit-embed-code-form'
import {
  embedCodeSoundcloud,
  embedCodeSoundcloudFixtureRaw,
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

beforeEach(() => {
  jest.clearAllMocks()
})

function pasteIframe(value: string) {
  const input = document.querySelector(
    'input[name="iframe"]'
  ) as HTMLInputElement
  fireEvent.change(input, { target: { value } })
}

const iframeRegex = /iframe/i
const captionRegex = /caption/i
const embedTypeLabel = 'Embed type'
const contentTypeLabel = 'Content type'
const removeButtonName = /remove embed/i

describe('EditEmbedCode', () => {
  describe('visibility before an embed is parsed', () => {
    it('shows the iframe paste input', () => {
      renderComponent()
      expect(
        document.querySelector('input[name="iframe"]')
      ).toBeInTheDocument()
      expect(
        screen.queryByTitle('Embedded media preview')
      ).not.toBeInTheDocument()
    })

    it('hides embed type and content type', () => {
      renderComponent()
      expect(screen.getByLabelText(embedTypeLabel)).not.toBeVisible()
      expect(
        screen.getByLabelText(contentTypeLabel)
      ).not.toBeVisible()
    })

    it('has no accessible caption field, but renders it as a hidden input', () => {
      renderComponent()
      expect(
        screen.queryByLabelText(captionRegex)
      ).not.toBeInTheDocument()
      expect(
        document.querySelector('input[name="caption"]')
      ).toHaveAttribute('type', 'hidden')
    })

    it('does not render source or host inputs at all', () => {
      renderComponent()
      expect(
        document.querySelector('input[name="src"]')
      ).not.toBeInTheDocument()
      expect(
        document.querySelector('input[name="host"]')
      ).not.toBeInTheDocument()
    })
  })

  describe('parsing the iframe input', () => {
    it('replaces the paste input with a live preview on success', () => {
      renderComponent()
      pasteIframe(embedCodeYoutubeFixture)

      expect(
        document.querySelector('input[name="iframe"]')
      ).not.toBeInTheDocument()
      expect(
        screen.getByTitle('Embedded media preview')
      ).toBeInTheDocument()
    })

    it('shows a toast and resets on invalid input', () => {
      renderComponent()
      pasteIframe('invalid iframe code')

      expect(mockAddError).toHaveBeenCalledWith(
        'Error parsing iframe.'
      )
      expect(
        screen.queryByTitle('Embedded media preview')
      ).not.toBeInTheDocument()
      expect(
        document.querySelector('input[name="iframe"]')
      ).toHaveValue('')
    })

    it('clears the input value without an error toast when emptied', () => {
      renderComponent()
      pasteIframe('')

      expect(mockAddError).not.toHaveBeenCalled()
      expect(
        document.querySelector('input[name="iframe"]')
      ).toHaveValue('')
    })

    it('parses on Ctrl+V even without a native paste event', () => {
      renderComponent()
      const input = document.querySelector(
        'input[name="iframe"]'
      ) as HTMLInputElement
      input.value = embedCodeYoutubeFixture
      fireEvent.keyDown(input, { key: 'v', ctrlKey: true })

      expect(
        screen.getByTitle('Embedded media preview')
      ).toBeInTheDocument()
    })

    it('parses from a paste event', () => {
      renderComponent()
      const input = document.querySelector(
        'input[name="iframe"]'
      ) as HTMLInputElement
      fireEvent.paste(input, {
        clipboardData: {
          getData: () => embedCodeYoutubeFixture
        }
      })

      expect(
        screen.getByTitle('Embedded media preview')
      ).toBeInTheDocument()
    })

    it('prevents drag-and-drop onto the input', () => {
      renderComponent()
      const input = document.querySelector(
        'input[name="iframe"]'
      ) as HTMLInputElement
      const dropEvent = new Event('drop', {
        bubbles: true,
        cancelable: true
      })
      fireEvent(input, dropEvent)

      expect(dropEvent.defaultPrevented).toBe(true)
    })
  })

  describe('visibility once an embed is parsed', () => {
    it('shows caption as a text input, and shows src/host as hidden inputs', () => {
      renderComponent()
      pasteIframe(embedCodeYoutubeFixture)

      expect(screen.getByLabelText(captionRegex)).toBeVisible()
      expect(screen.getByLabelText(captionRegex)).toHaveAttribute(
        'type',
        'text'
      )

      const srcInput = document.querySelector('input[name="src"]')
      expect(srcInput).toHaveAttribute('type', 'hidden')
      expect(srcInput).toHaveValue(embedCodeFixture.src)

      const hostInput = document.querySelector('input[name="host"]')
      expect(hostInput).toHaveAttribute('type', 'hidden')
      expect(hostInput).toHaveValue(embedCodeFixture.host)
    })

    it('shows embed type for a youtube embed', () => {
      renderComponent()
      pasteIframe(embedCodeYoutubeFixture)

      expect(screen.getByLabelText(embedTypeLabel)).toBeVisible()
    })

    it('hides embed type for a non-youtube embed, but still shows content type', () => {
      renderComponent()
      pasteIframe(embedCodeSoundcloudFixtureRaw)

      expect(screen.getByLabelText(embedTypeLabel)).not.toBeVisible()
      expect(screen.getByLabelText(contentTypeLabel)).toBeVisible()
    })
  })

  describe('removing a parsed embed', () => {
    it('reverts visibility back to the pre-parse state', () => {
      renderComponent()
      pasteIframe(embedCodeYoutubeFixture)
      fireEvent.click(
        screen.getByRole('button', { name: removeButtonName })
      )

      expect(
        document.querySelector('input[name="iframe"]')
      ).toBeInTheDocument()
      expect(
        screen.queryByTitle('Embedded media preview')
      ).not.toBeInTheDocument()
      expect(screen.getByLabelText(embedTypeLabel)).not.toBeVisible()
      expect(
        screen.getByLabelText(contentTypeLabel)
      ).not.toBeVisible()
      expect(
        document.querySelector('input[name="src"]')
      ).not.toBeInTheDocument()
      expect(
        document.querySelector('input[name="host"]')
      ).not.toBeInTheDocument()
    })
  })

  describe('embed type', () => {
    it('is required', () => {
      renderComponent()
      expect(screen.getByLabelText(embedTypeLabel)).toBeRequired()
    })

    it('updates when a type is selected', () => {
      renderComponent()
      pasteIframe(embedCodeYoutubeFixture)
      expect(screen.getByLabelText(embedTypeLabel)).toHaveValue(
        'video'
      )

      fireEvent.change(screen.getByLabelText(embedTypeLabel), {
        target: { value: 'audio' }
      })
      expect(screen.getByLabelText(embedTypeLabel)).toHaveValue(
        'audio'
      )
    })

    it('falls back to audio rather than clearing when the placeholder is selected', () => {
      renderComponent()
      pasteIframe(embedCodeYoutubeFixture)

      fireEvent.change(screen.getByLabelText(embedTypeLabel), {
        target: { value: '' }
      })

      expect(screen.getByLabelText(embedTypeLabel)).toHaveValue(
        'audio'
      )
    })
  })

  describe('content type', () => {
    it('is required', () => {
      renderComponent()
      expect(screen.getByLabelText(contentTypeLabel)).toBeRequired()
    })

    it('updates when an option is selected', () => {
      renderComponent()
      pasteIframe(embedCodeYoutubeFixture)

      fireEvent.change(screen.getByLabelText(contentTypeLabel), {
        target: { value: 'official_music_video' }
      })

      expect(screen.getByLabelText(contentTypeLabel)).toHaveValue(
        'official_music_video'
      )
    })

    it('clears when the placeholder is selected', () => {
      renderComponent()
      pasteIframe(embedCodeYoutubeFixture)

      fireEvent.change(screen.getByLabelText(contentTypeLabel), {
        target: { value: 'podcast' }
      })
      expect(screen.getByLabelText(contentTypeLabel)).toHaveValue(
        'podcast'
      )

      fireEvent.change(screen.getByLabelText(contentTypeLabel), {
        target: { value: '' }
      })
      expect(screen.getByLabelText(contentTypeLabel)).toHaveValue('')
    })

    it('hides video-only options and clears an invalidated selection when switching to audio', () => {
      renderComponent()
      pasteIframe(embedCodeYoutubeFixture)
      expect(
        screen.getByRole('option', { name: 'Trailer' })
      ).toBeInTheDocument()

      fireEvent.change(screen.getByLabelText(contentTypeLabel), {
        target: { value: 'trailer' }
      })
      expect(screen.getByLabelText(contentTypeLabel)).toHaveValue(
        'trailer'
      )

      fireEvent.change(screen.getByLabelText(embedTypeLabel), {
        target: { value: 'audio' }
      })

      expect(
        screen.queryByRole('option', { name: 'Trailer' })
      ).not.toBeInTheDocument()
      expect(screen.getByLabelText(contentTypeLabel)).toHaveValue('')
    })

    it('keeps a shared content type when switching to audio', () => {
      renderComponent()
      pasteIframe(embedCodeYoutubeFixture)

      fireEvent.change(screen.getByLabelText(contentTypeLabel), {
        target: { value: 'podcast' }
      })
      fireEvent.change(screen.getByLabelText(embedTypeLabel), {
        target: { value: 'audio' }
      })

      expect(screen.getByLabelText(contentTypeLabel)).toHaveValue(
        'podcast'
      )
    })

    it('shows video-only options again when switching back to video', () => {
      renderComponent()
      pasteIframe(embedCodeYoutubeFixture)

      fireEvent.change(screen.getByLabelText(embedTypeLabel), {
        target: { value: 'audio' }
      })
      expect(
        screen.queryByRole('option', { name: 'Trailer' })
      ).not.toBeInTheDocument()

      fireEvent.change(screen.getByLabelText(embedTypeLabel), {
        target: { value: 'video' }
      })
      expect(
        screen.getByRole('option', { name: 'Trailer' })
      ).toBeInTheDocument()
    })
  })

  describe('default values', () => {
    it('sets defaultValue for each input from the embedCode prop', () => {
      renderComponent({
        embedCode: {
          src: embedCodeSoundcloud.src,
          host: embedCodeSoundcloud.host,
          caption: 'This is an embed code for testing purposes.',
          type: 'audio',
          contentType: 'podcast'
        }
      })

      expect(document.querySelector('input[name="src"]')).toHaveValue(
        embedCodeSoundcloud.src
      )
      expect(
        document.querySelector('input[name="host"]')
      ).toHaveValue(embedCodeSoundcloud.host)
      expect(screen.getByLabelText(captionRegex)).toHaveValue(
        'This is an embed code for testing purposes.'
      )
      expect(screen.getByLabelText(embedTypeLabel)).toHaveValue(
        'audio'
      )
      expect(screen.getByLabelText(contentTypeLabel)).toHaveValue(
        'podcast'
      )
    })

    it('treats an embedCode without a src as unparsed', () => {
      renderComponent({ embedCode: { caption: 'Orphaned caption' } })

      expect(
        document.querySelector('input[name="iframe"]')
      ).toBeInTheDocument()
      expect(
        screen.queryByLabelText(captionRegex)
      ).not.toBeInTheDocument()
    })

    it('auto-populates src, host and type from a pasted iframe, but not content type', () => {
      renderComponent()
      pasteIframe(embedCodeYoutubeFixture)

      expect(
        screen.getByDisplayValue(embedCodeFixture.src)
      ).toBeInTheDocument()
      expect(
        screen.getByDisplayValue(embedCodeFixture.host)
      ).toBeInTheDocument()
      expect(screen.getByLabelText(embedTypeLabel)).toHaveValue(
        'video'
      )
      expect(screen.getByLabelText(captionRegex)).toHaveValue('')
      // Not auto-derived — left for the admin to categorize manually.
      expect(screen.getByLabelText(contentTypeLabel)).toHaveValue('')
    })
  })

  describe('name prefixing', () => {
    it('applies the prefix before an embed is parsed', () => {
      renderComponent({
        embedCode: {},
        index: 2
      })

      expect(screen.getByLabelText(iframeRegex)).toHaveAttribute(
        'name',
        'embedCodes[2].iframe'
      )
      expect(screen.getByLabelText(embedTypeLabel)).toHaveAttribute(
        'name',
        'embedCodes[2].type'
      )
      expect(screen.getByLabelText(contentTypeLabel)).toHaveAttribute(
        'name',
        'embedCodes[2].contentType'
      )
    })

    it('applies the prefix once an embed is parsed', () => {
      renderComponent({
        embedCode: {
          src: embedCodeSoundcloud.src,
          host: embedCodeSoundcloud.host
        },
        index: 3
      })

      expect(screen.getByLabelText(captionRegex)).toHaveAttribute(
        'name',
        'embedCodes[3].caption'
      )
      expect(
        document.querySelector('input[name="embedCodes[3].src"]')
      ).toBeInTheDocument()
      expect(
        document.querySelector('input[name="embedCodes[3].host"]')
      ).toBeInTheDocument()
    })
  })

  describe('error display', () => {
    it('displays caption errors once the field becomes visible', () => {
      const errors = { caption: ['Caption is too long'] }
      renderComponent({ errors })
      pasteIframe(embedCodeYoutubeFixture)

      expect(
        screen.getByText(/caption is too long/i)
      ).toBeInTheDocument()
    })
  })

  describe('input attributes', () => {
    it('applies iframe input attributes correctly', () => {
      renderComponent()

      const iframeInput = screen.getByLabelText(iframeRegex)
      expect(iframeInput).toHaveAttribute('maxlength', '1500')
      expect(iframeInput).toHaveAttribute(
        'placeholder',
        '<iframe></iframe>'
      )
      expect(iframeInput).toHaveAttribute('type', 'text')
      expect(iframeInput).toBeRequired()
    })

    it('applies caption attributes correctly once an embed is parsed', () => {
      renderComponent()
      pasteIframe(embedCodeYoutubeFixture)

      const captionInput = screen.getByLabelText(captionRegex)
      expect(captionInput).toHaveAttribute('maxlength', '255')
      expect(captionInput).toHaveAttribute(
        'placeholder',
        'Video by Artist Name (2024)'
      )
    })
  })
})
