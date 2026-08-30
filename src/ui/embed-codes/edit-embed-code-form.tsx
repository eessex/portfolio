import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState
} from 'react'
import type { z } from 'zod'

import { previewEmbedCodeMetadata } from '@/lib/embed-codes/preview-metadata'
import {
  type createEmbedCodeSchema,
  type EmbedCode,
  embedCodeContentTypes,
  EmbedCodeContentTypesByType,
  EmbedCodeTypes,
  embedCodeTypes
} from '@/lib/embed-codes/schemas/db'
import { MAX_STRING_LENGTH_SHORT } from '@/lib/schemas/primitives'
import { EmbedCodeItem } from '@/ui/embed-codes/embed-code'
import { extractIframeParams } from '@/ui/embed-codes/util'
import styles from '@/ui/form/form.module.scss'
import { Input } from '@/ui/form/input'
import { Select } from '@/ui/form/select'
import { useToast } from '@/ui/toast/toast-context'

interface EmbedCodeProps {
  embedCode?: Partial<EmbedCode>
  errors?: z.inferFlattenedErrors<
    typeof createEmbedCodeSchema
  >['fieldErrors']
  index?: number
  /**
   * Hides the inline "Remove embed" button on the parsed preview.
   * Not currently used.
   */
  isRemoveButtonHidden?: boolean
  isRequired?: boolean
  /**
   * Reports when a pasted iframe goes from unparsed/absent to
   * successfully parsed or back.
   */
  onReadyChange?: (isReady: boolean) => void
}

export const EditEmbedCode = ({
  index,
  embedCode,
  errors,
  isRemoveButtonHidden,
  isRequired = true,
  onReadyChange
}: EmbedCodeProps) => {
  const [embedCodeIframe, setEmbedCodeIframe] =
    useState<Partial<EmbedCode> | null>(() => {
      if (!embedCode?.src) return null
      return embedCode
    })
  const [iframeInputValue, setIframeInputValue] = useState('')
  // oEmbed title/thumbnail for the collapsed-chip preview
  const [previewMeta, setPreviewMeta] = useState<{
    title?: string
    thumbnailUrl?: string
  } | null>(null)
  // Ignore a slower resolve landing after a newer paste cleared/changed it.
  const previewRequestId = useRef(0)
  const namePrefix =
    typeof index === 'number' ? `embedCodes[${index}].` : ''
  const detailsFieldsetId = useId()

  const { addErrorMessage } = useToast()

  useEffect(() => {
    onReadyChange?.(!!embedCodeIframe)
  }, [embedCodeIframe, onReadyChange])

  // A resolve that lands after unmount becomes stale (no match).
  useEffect(() => {
    return () => {
      previewRequestId.current = -1
    }
  }, [])

  const changeIframeValue = useCallback(
    (value: string) => {
      if (!value) {
        previewRequestId.current++
        setEmbedCodeIframe(null)
        setIframeInputValue('')
        setPreviewMeta(null)
        return
      }

      try {
        const iframeData = extractIframeParams(
          { iframe: value },
          true
        )
        setEmbedCodeIframe(iframeData)
        setIframeInputValue(value)

        // Resolve the chip's cover image + title from the host's oEmbed
        // endpoint, keyed so a stale response can't clobber a newer paste.
        const requestId = ++previewRequestId.current
        setPreviewMeta(null)
        if (iframeData?.host && iframeData.src) {
          previewEmbedCodeMetadata(
            iframeData.host,
            iframeData.src
          ).then((meta) => {
            if (previewRequestId.current === requestId) {
              setPreviewMeta(meta)
            }
          })
        }
      } catch {
        addErrorMessage('Error parsing iframe.')
        previewRequestId.current++
        setEmbedCodeIframe(null)
        setIframeInputValue('')
        setPreviewMeta(null)
      }
    },
    [addErrorMessage]
  )

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'v' && event.ctrlKey) {
      changeIframeValue(event.currentTarget.value)
    }
  }

  function onPaste(event: React.ClipboardEvent<HTMLInputElement>) {
    event.preventDefault()
    const text = event.clipboardData.getData('text/plain')
    changeIframeValue(text)
  }

  function onBeforeInput(event: React.FormEvent<HTMLInputElement>) {
    const native = event.nativeEvent as InputEvent

    const allowedTypes = [
      'insertFromPaste',
      'insertReplacementText' // autocomplete
    ]

    if (!allowedTypes.includes(native.inputType)) {
      event.preventDefault()
    }
  }

  function onChange(event: React.ChangeEvent<HTMLInputElement>) {
    changeIframeValue(event.target.value)
  }

  function onRemove() {
    changeIframeValue('')
  }

  function setEmbedType(type: EmbedCode['type']) {
    if (!embedCodeIframe) return

    // A video-only content type (e.g. "Trailer") no longer applies once
    // the embed is marked audio — clear it rather than silently
    // submitting a mismatched value.
    const contentTypeStillValid =
      type !== EmbedCodeTypes.audio ||
      !embedCodeIframe.contentType ||
      !(
        EmbedCodeContentTypesByType.video as readonly string[]
      ).includes(embedCodeIframe.contentType)

    setEmbedCodeIframe({
      ...embedCodeIframe,
      type,
      contentType: contentTypeStillValid
        ? embedCodeIframe.contentType
        : undefined
    })
  }

  function setEmbedContentType(
    contentType: EmbedCode['contentType']
  ) {
    if (!embedCodeIframe) return

    setEmbedCodeIframe({
      ...embedCodeIframe,
      contentType
    })
  }

  return (
    <>
      <div>
        {embedCodeIframe ? (
          <EmbedCodeItem
            ariaControls={detailsFieldsetId}
            ariaExpanded
            embedCode={embedCodeIframe}
            onRemove={isRemoveButtonHidden ? undefined : onRemove}
          />
        ) : (
          <Input
            attributes={{
              'aria-controls': detailsFieldsetId,
              'aria-expanded': false,
              maxLength: 1500,
              name: `${namePrefix}iframe`,
              placeholder: '<iframe></iframe>',
              required: isRequired,
              type: 'text'
            }}
            description='Paste a full iframe embed code. Supported services: Bandcamp, Mixcloud, Soundcloud, Spotify, YouTube.'
            value={iframeInputValue}
            label='iframe code'
            onKeyDown={onKeyDown}
            onDrop={(e) => e.preventDefault()}
            onPaste={onPaste}
            onChange={onChange}
            onBeforeInput={onBeforeInput}
            isLabelHidden
          />
        )}
      </div>
      <fieldset
        hidden={!embedCodeIframe}
        className={embedCodeIframe ? 'expanded' : undefined}
        id={detailsFieldsetId}
      >
        <legend className='visually-hidden'>Embed details</legend>
        <div className={styles['input-group']}>
          <Select
            key={embedCodeIframe?.type}
            options={[...embedCodeTypes]}
            onChange={(v) =>
              setEmbedType(
                (v || EmbedCodeTypes.audio) as EmbedCode['type']
              )
            }
            label='Media type'
            placeholder='Select a media type'
            value={embedCodeIframe?.type}
            attributes={{
              hidden: embedCodeIframe?.host !== 'youtube',
              required: !!embedCodeIframe,
              name: `${namePrefix}type`
            }}
          />
          <Select
            key={`${embedCodeIframe?.type}-${embedCodeIframe?.contentType}`}
            options={[
              ...(embedCodeIframe?.type === EmbedCodeTypes.audio
                ? EmbedCodeContentTypesByType.shared
                : embedCodeContentTypes)
            ]}
            onChange={(v) =>
              setEmbedContentType(v as EmbedCode['contentType'])
            }
            label='Content type'
            placeholder='Select a content type'
            value={embedCodeIframe?.contentType}
            attributes={{
              required: !!embedCodeIframe,
              name: `${namePrefix}contentType`
            }}
          />
        </div>
        <Input
          attributes={{
            maxLength: MAX_STRING_LENGTH_SHORT,
            name: `${namePrefix}caption`,
            placeholder: 'Video by Artist Name (2024)',
            type: 'text'
          }}
          defaultValue={embedCode?.caption}
          description='Displayed below the iframe wherever it appears.'
          errors={errors?.caption}
          label='Caption'
        />
        {embedCodeIframe?.src && (
          <Input
            attributes={{
              name: `${namePrefix}src`,
              type: 'hidden',
              required: true
            }}
            defaultValue={embedCodeIframe.src}
            label='Embed Code Source'
          />
        )}
        {embedCodeIframe?.host && (
          <Input
            attributes={{
              name: `${namePrefix}host`,
              type: 'hidden',
              required: true
            }}
            defaultValue={embedCodeIframe.host}
            label='Embed Code Host'
          />
        )}
        {/* Display-only oEmbed metadata for the collapsed new-item chip.
            Not schema fields, so `createEmbedCodeSchema` strips them on
            submit — the server re-resolves title/cover at save time. */}
        {previewMeta?.title && (
          <Input
            attributes={{
              name: `${namePrefix}previewTitle`,
              type: 'hidden'
            }}
            defaultValue={previewMeta.title}
            label='Embed Code Preview Title'
          />
        )}
        {previewMeta?.thumbnailUrl && (
          <Input
            attributes={{
              name: `${namePrefix}previewThumbnailUrl`,
              type: 'hidden'
            }}
            defaultValue={previewMeta.thumbnailUrl}
            label='Embed Code Preview Thumbnail'
          />
        )}
      </fieldset>
    </>
  )
}
