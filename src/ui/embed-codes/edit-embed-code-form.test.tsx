import {
  act,
  fireEvent,
  render,
  screen
} from '@testing-library/react'

import { embedCodeFixture } from '@/lib/embed-codes/fixtures'
import { previewEmbedCodeMetadata } from '@/lib/embed-codes/preview-metadata'
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
jest.mock('@/lib/embed-codes/preview-metadata', () => ({
  previewEmbedCodeMetadata: jest.fn()
}))
const mockPreviewMetadata =
  previewEmbedCodeMetadata as jest.MockedFunction<
    typeof previewEmbedCodeMetadata
  >
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
  mockPreviewMetadata.mockResolvedValue({})
})

// Every iframe parse fires an async `previewEmbedCodeMetadata` whose
// state update lands after the test body; drain it inside act so it
// neither warns nor leaks into the next test.
afterEach(async () => {
  await act(async () => {
    await Promise.resolve()
  })
})

// A `previewEmbedCodeMetadata` result whose resolution we flush inside
// act, for deterministic assertions on the hidden preview inputs.
function deferPreviewMetadata() {
  let resolve!: (meta: {
    title?: string
    thumbnailUrl?: string
  }) => void
  mockPreviewMetadata.mockReturnValueOnce(
    new Promise((r) => {
      resolve = r
    })
  )
  return async (meta: { title?: string; thumbnailUrl?: string }) => {
    await act(async () => {
      resolve(meta)
    })
  }
}

function pasteIframe(value: string, name = 'iframe') {
  const input = document.querySelector(
    `input[name="${name}"]`
  ) as HTMLInputElement
  fireEvent.change(input, { target: { value } })
}

const iframeRegex = /iframe/i
const captionRegex = /caption/i
const embedTypeLabel = /Media type/
const contentTypeLabel = /Content type/
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

    it('renders the caption field but keeps it not visible', () => {
      renderComponent()
      expect(screen.getByLabelText(captionRegex)).not.toBeVisible()
      expect(
        document.querySelector('input[name="caption"]')
      ).toHaveAttribute('type', 'text')
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

  describe('isRemoveButtonHidden', () => {
    it('hides the remove button once parsed, keeping the preview', () => {
      renderComponent({ isRemoveButtonHidden: true })
      pasteIframe(embedCodeYoutubeFixture)

      expect(
        screen.getByTitle('Embedded media preview')
      ).toBeInTheDocument()
      expect(
        screen.queryByRole('button', { name: removeButtonName })
      ).not.toBeInTheDocument()
    })

    it('still shows the remove button by default', () => {
      renderComponent()
      pasteIframe(embedCodeYoutubeFixture)

      expect(
        screen.getByRole('button', { name: removeButtonName })
      ).toBeInTheDocument()
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

    it('resets content type rather than carrying it over to the next embed', () => {
      renderComponent()
      pasteIframe(embedCodeYoutubeFixture)
      fireEvent.change(screen.getByLabelText(contentTypeLabel), {
        target: { value: 'podcast' }
      })

      fireEvent.click(
        screen.getByRole('button', { name: removeButtonName })
      )
      pasteIframe(embedCodeYoutubeFixture)

      expect(screen.getByLabelText(contentTypeLabel)).toHaveValue('')
    })
  })

  describe('embed type', () => {
    it('is required once an embed is parsed', () => {
      renderComponent()
      pasteIframe(embedCodeYoutubeFixture)
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
    it('is required once an embed is parsed', () => {
      renderComponent()
      pasteIframe(embedCodeYoutubeFixture)
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
      expect(screen.getByLabelText(captionRegex)).not.toBeVisible()
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

  describe('progressive disclosure wiring', () => {
    it('groups the secondary fields in a single fieldset', () => {
      renderComponent()

      const fieldset = document.querySelector('fieldset')
      expect(fieldset).toContainElement(
        screen.getByLabelText(embedTypeLabel)
      )
      expect(fieldset).toContainElement(
        screen.getByLabelText(contentTypeLabel)
      )
      expect(fieldset).toContainElement(
        screen.getByLabelText(captionRegex)
      )
    })

    it('points the iframe input at the fieldset before parsing', () => {
      renderComponent()

      const fieldset = document.querySelector('fieldset') as Element
      const iframeInput = screen.getByLabelText(iframeRegex)

      expect(iframeInput).toHaveAttribute('aria-expanded', 'false')
      expect(iframeInput).toHaveAttribute(
        'aria-controls',
        fieldset.id
      )
    })

    it('points the remove button at the fieldset once parsed', () => {
      renderComponent()
      pasteIframe(embedCodeYoutubeFixture)

      const fieldset = document.querySelector('fieldset') as Element
      const removeButton = screen.getByRole('button', {
        name: removeButtonName
      })

      expect(removeButton).toHaveAttribute('aria-expanded', 'true')
      expect(removeButton).toHaveAttribute(
        'aria-controls',
        fieldset.id
      )
    })
  })

  describe('onReadyChange', () => {
    it('reports not ready before an iframe is parsed', () => {
      const onReadyChange = jest.fn()
      renderComponent({ onReadyChange })

      expect(onReadyChange).toHaveBeenLastCalledWith(false)
    })

    it('reports ready once the iframe parses successfully', () => {
      const onReadyChange = jest.fn()
      renderComponent({ onReadyChange })
      pasteIframe(embedCodeYoutubeFixture)

      expect(onReadyChange).toHaveBeenLastCalledWith(true)
    })

    it('reports not ready when a pasted iframe fails to parse', () => {
      const onReadyChange = jest.fn()
      renderComponent({ onReadyChange })
      pasteIframe('invalid iframe code')

      expect(onReadyChange).toHaveBeenLastCalledWith(false)
    })

    it('reports not ready again once the parsed embed is removed', () => {
      const onReadyChange = jest.fn()
      renderComponent({ onReadyChange })
      pasteIframe(embedCodeYoutubeFixture)
      fireEvent.click(
        screen.getByRole('button', { name: removeButtonName })
      )

      expect(onReadyChange).toHaveBeenLastCalledWith(false)
    })
  })

  describe('oEmbed preview metadata', () => {
    const resolvedMeta = {
      title: 'Resolved title',
      thumbnailUrl: 'https://img.youtube.com/vi/abc/hqdefault.jpg'
    }

    it('resolves the host/src once an iframe is parsed', () => {
      renderComponent()
      pasteIframe(embedCodeYoutubeFixture)

      expect(mockPreviewMetadata).toHaveBeenCalledWith(
        embedCodeFixture.host,
        embedCodeFixture.src
      )
    })

    it('renders the resolved title/thumbnail as hidden inputs', async () => {
      const resolvePreview = deferPreviewMetadata()
      renderComponent()
      pasteIframe(embedCodeYoutubeFixture)
      await resolvePreview(resolvedMeta)

      const titleInput = document.querySelector(
        'input[name="previewTitle"]'
      )
      expect(titleInput).toHaveAttribute('type', 'hidden')
      expect(titleInput).toHaveValue(resolvedMeta.title)

      const thumbnailInput = document.querySelector(
        'input[name="previewThumbnailUrl"]'
      )
      expect(thumbnailInput).toHaveAttribute('type', 'hidden')
      expect(thumbnailInput).toHaveValue(resolvedMeta.thumbnailUrl)
    })

    it('prefixes the preview inputs when indexed', async () => {
      const resolvePreview = deferPreviewMetadata()
      renderComponent({ index: 2 })
      pasteIframe(embedCodeYoutubeFixture, 'embedCodes[2].iframe')
      await resolvePreview(resolvedMeta)

      expect(
        document.querySelector(
          'input[name="embedCodes[2].previewTitle"]'
        )
      ).toBeInTheDocument()
      expect(
        document.querySelector(
          'input[name="embedCodes[2].previewThumbnailUrl"]'
        )
      ).toBeInTheDocument()
    })

    it('renders no preview inputs when the host returns no metadata', async () => {
      const resolvePreview = deferPreviewMetadata()
      renderComponent()
      pasteIframe(embedCodeYoutubeFixture)
      await resolvePreview({})

      expect(
        document.querySelector('input[name="previewTitle"]')
      ).not.toBeInTheDocument()
      expect(
        document.querySelector('input[name="previewThumbnailUrl"]')
      ).not.toBeInTheDocument()
    })

    it('drops resolved metadata once the parsed embed is removed', async () => {
      const resolvePreview = deferPreviewMetadata()
      renderComponent()
      pasteIframe(embedCodeYoutubeFixture)
      await resolvePreview(resolvedMeta)
      expect(
        document.querySelector('input[name="previewTitle"]')
      ).toBeInTheDocument()

      fireEvent.click(
        screen.getByRole('button', { name: removeButtonName })
      )

      expect(
        document.querySelector('input[name="previewTitle"]')
      ).not.toBeInTheDocument()
    })
  })

  describe('onBusyChange (Save gating)', () => {
    it('reports busy while resolving and settled once resolved', async () => {
      const onBusyChange = jest.fn()
      const resolvePreview = deferPreviewMetadata()
      renderComponent({ onBusyChange })
      pasteIframe(embedCodeYoutubeFixture)

      expect(screen.getByText('Loading preview…')).toBeInTheDocument()
      expect(onBusyChange).toHaveBeenLastCalledWith(true)

      await resolvePreview({})

      expect(
        screen.queryByText('Loading preview…')
      ).not.toBeInTheDocument()
      expect(onBusyChange).toHaveBeenLastCalledWith(false)
    })

    it('reports settled even when resolution fails', async () => {
      const onBusyChange = jest.fn()
      let reject!: (err: unknown) => void
      mockPreviewMetadata.mockReturnValueOnce(
        new Promise((_resolve, r) => {
          reject = r
        })
      )
      renderComponent({ onBusyChange })
      pasteIframe(embedCodeYoutubeFixture)
      expect(onBusyChange).toHaveBeenLastCalledWith(true)

      await act(async () => {
        reject(new Error('oEmbed failed'))
      })

      expect(onBusyChange).toHaveBeenLastCalledWith(false)
    })

    it('reports settled when the iframe is cleared before resolving', () => {
      const onBusyChange = jest.fn()
      deferPreviewMetadata()
      renderComponent({ onBusyChange })
      pasteIframe(embedCodeYoutubeFixture)
      expect(onBusyChange).toHaveBeenLastCalledWith(true)

      fireEvent.click(
        screen.getByRole('button', { name: removeButtonName })
      )

      expect(onBusyChange).toHaveBeenLastCalledWith(false)
    })
  })
})
