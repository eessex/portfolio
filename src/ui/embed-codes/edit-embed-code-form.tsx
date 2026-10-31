import { useCallback, useEffect, useRef, useState } from 'react'
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
import {
  DisclosureDetails,
  useDisclosureDetails
} from '@/ui/form/disclosure-details'
import styles from '@/ui/form/form.module.scss'
import { Input } from '@/ui/form/input'
import { Select } from '@/ui/form/select'
import { useNamePrefix } from '@/ui/item-picker/name-prefix'
import { useToast } from '@/ui/toast/toast-context'

interface EmbedCodeProps {
  embedCode?: Partial<EmbedCode>
  errors?: z.inferFlattenedErrors<
    typeof createEmbedCodeSchema
  >['fieldErrors']
  isRequired?: boolean
  /**
   * So the picker can block Save until the chip's title/thumbnail exist (or fail).
   */
  onBusyChange?: (isBusy: boolean) => void
}

// A video-only content type (e.g. "Trailer") doesn't apply to audio.
function isContentTypeValidFor(
  type: EmbedCode['type'] | undefined,
  contentType: EmbedCode['contentType'] | undefined
) {
  return (
    type !== EmbedCodeTypes.audio ||
    !contentType ||
    !(
      EmbedCodeContentTypesByType.video as readonly string[]
    ).includes(contentType)
  )
}

export const EditEmbedCode = ({
  embedCode,
  errors,
  isRequired = true,
  onBusyChange
}: EmbedCodeProps) => {
  const [embedCodeIframe, setEmbedCodeIframe] =
    useState<Partial<EmbedCode> | null>(() => {
      if (!embedCode?.src) return null
      return embedCode
    })
  // Kept apart from the parsed iframe so it survives removing it.
  const [contentType, setContentType] = useState<
    EmbedCode['contentType'] | undefined
  >(embedCode?.src ? embedCode.contentType : undefined)
  const [iframeInputValue, setIframeInputValue] = useState('')
  // oEmbed title/thumbnail for the collapsed-chip preview
  const [previewMeta, setPreviewMeta] = useState<{
    title?: string
    thumbnailUrl?: string
  } | null>(null)
  const [isPreviewLoading, setIsPreviewLoading] = useState(false)
  // Ignore a slower resolve landing after a newer paste cleared/changed it.
  const previewRequestId = useRef(0)
  const namePrefix = useNamePrefix()
  // Details stay open after the iframe is removed if they have
  // content; the host-derived media type select is hidden by then.
  const disclosure = useDisclosureDetails({
    isRevealed: !!embedCodeIframe,
    isKeptWithContent: true
  })
  const { id: detailsFieldsetId, isExpanded } = disclosure

  const { addErrorMessage } = useToast()

  useEffect(() => {
    onBusyChange?.(isPreviewLoading)
  }, [isPreviewLoading, onBusyChange])

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
        setIsPreviewLoading(false)
        return
      }

      try {
        const iframeData = extractIframeParams(
          { iframe: value },
          true
        )
        setEmbedCodeIframe(iframeData)
        setIframeInputValue(value)
        if (!isContentTypeValidFor(iframeData?.type, contentType)) {
          setContentType(undefined)
        }

        // Resolve the chip's cover image + title from the host's oEmbed
        // endpoint, keyed so a stale response can't clobber a newer paste.
        const requestId = ++previewRequestId.current
        setPreviewMeta(null)
        if (iframeData?.host && iframeData.src) {
          setIsPreviewLoading(true)
          previewEmbedCodeMetadata(iframeData.host, iframeData.src)
            .then((meta) => {
              if (previewRequestId.current === requestId) {
                setPreviewMeta(meta)
              }
            })
            .catch(() => {})
            .finally(() => {
              if (previewRequestId.current === requestId) {
                setIsPreviewLoading(false)
              }
            })
        } else {
          setIsPreviewLoading(false)
        }
      } catch {
        addErrorMessage('Error parsing iframe.')
        previewRequestId.current++
        setEmbedCodeIframe(null)
        setIframeInputValue('')
        setPreviewMeta(null)
        setIsPreviewLoading(false)
      }
    },
    [addErrorMessage, contentType]
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

    // Clear an invalidated content type rather than silently
    // submitting a mismatched value.
    if (!isContentTypeValidFor(type, contentType)) {
      setContentType(undefined)
    }
    setEmbedCodeIframe({ ...embedCodeIframe, type })
  }

  return (
    <>
      <div className={embedCodeIframe ? 'item-preview' : undefined}>
        {embedCodeIframe ? (
          <EmbedCodeItem
            ariaControls={detailsFieldsetId}
            ariaExpanded={isExpanded}
            embedCode={embedCodeIframe}
            onRemove={onRemove}
          />
        ) : (
          <Input
            attributes={{
              'aria-controls': detailsFieldsetId,
              'aria-expanded': isExpanded,
              maxLength: 1500,
              name: `${namePrefix}iframe`,
              placeholder: '<iframe></iframe>',
              // Details can't be saved without an iframe.
              required: isRequired || isExpanded,
              type: 'text'
            }}
            description='Paste an iframe from Bandcamp, Mixcloud, Soundcloud, Spotify, Vimeo or YouTube.'
            // `src`/`host` are hidden fields parsed from the iframe.
            errors={
              errors?.src || errors?.host
                ? ['Paste an iframe embed code']
                : undefined
            }
            value={iframeInputValue}
            label='Iframe code'
            onKeyDown={onKeyDown}
            onDrop={(e) => e.preventDefault()}
            onPaste={onPaste}
            onChange={onChange}
            onBeforeInput={onBeforeInput}
            isLabelHidden={!isExpanded}
          />
        )}
      </div>
      <DisclosureDetails {...disclosure} legend='Embed details'>
        {isPreviewLoading && (
          <p role='status' aria-live='polite'>
            Loading preview…
          </p>
        )}
        <div className={styles['input-group']}>
          <Select
            key={embedCodeIframe?.type}
            options={[...embedCodeTypes]}
            onChange={(v) =>
              setEmbedType(
                (v || EmbedCodeTypes.audio) as EmbedCode['type']
              )
            }
            errors={errors?.type}
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
            key={`${embedCodeIframe?.type}-${contentType}`}
            options={[
              ...(embedCodeIframe?.type === EmbedCodeTypes.audio
                ? EmbedCodeContentTypesByType.shared
                : embedCodeContentTypes)
            ]}
            onChange={(v) =>
              setContentType(
                (v || undefined) as EmbedCode['contentType']
              )
            }
            errors={errors?.contentType}
            label='Content type'
            placeholder='Select a content type'
            value={contentType}
            attributes={{
              required: isExpanded,
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
          <input
            type='hidden'
            name={`${namePrefix}src`}
            defaultValue={embedCodeIframe.src}
          />
        )}
        {embedCodeIframe?.host && (
          <input
            type='hidden'
            name={`${namePrefix}host`}
            defaultValue={embedCodeIframe.host}
          />
        )}
        {/* Display-only oEmbed metadata for the collapsed new-item chip.
            Not schema fields, so `createEmbedCodeSchema` strips them on
            submit — the server re-resolves title/cover at save time. */}
        {previewMeta?.title && (
          <input
            type='hidden'
            name={`${namePrefix}previewTitle`}
            defaultValue={previewMeta.title}
          />
        )}
        {previewMeta?.thumbnailUrl && (
          <input
            type='hidden'
            name={`${namePrefix}previewThumbnailUrl`}
            defaultValue={previewMeta.thumbnailUrl}
          />
        )}
      </DisclosureDetails>
    </>
  )
}
