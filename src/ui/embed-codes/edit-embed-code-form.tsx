import { useCallback, useState } from 'react'
import type { z } from 'zod'

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
}

export const EditEmbedCode = ({
  index,
  embedCode,
  errors
}: EmbedCodeProps) => {
  const [embedCodeIframe, setEmbedCodeIframe] =
    useState<Partial<EmbedCode> | null>(() => {
      if (!embedCode?.src) return null
      return embedCode
    })
  const [iframeInputValue, setIframeInputValue] = useState('')
  const namePrefix =
    typeof index === 'number' ? `embedCodes[${index}].` : ''

  const { addErrorMessage } = useToast()

  const changeIframeValue = useCallback(
    (value: string) => {
      if (!value) {
        setEmbedCodeIframe(null)
        setIframeInputValue('')
        return
      }

      try {
        const iframeData = extractIframeParams(
          { iframe: value },
          true
        )
        setEmbedCodeIframe(iframeData)
        setIframeInputValue(value)
      } catch {
        addErrorMessage('Error parsing iframe.')
        setEmbedCodeIframe(null)
        setIframeInputValue('')
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
            embedCode={embedCodeIframe}
            onRemove={onRemove}
          />
        ) : (
          <Input
            attributes={{
              maxLength: 1500,
              name: `${namePrefix}iframe`,
              placeholder: '<iframe></iframe>',
              required: true,
              type: 'text'
            }}
            description='Paste a full iframe embed code. Supported services: Bandcamp, Mixcloud, Soundcloud, Spotify, YouTube.'
            value={iframeInputValue}
            label='Embed iframe code'
            onKeyDown={onKeyDown}
            onDrop={(e) => e.preventDefault()}
            onPaste={onPaste}
            onChange={onChange}
            onBeforeInput={onBeforeInput}
          />
        )}
      </div>
      <div className={styles['input-group']}>
        <Select
          key={embedCodeIframe?.type}
          options={[...embedCodeTypes]}
          onChange={(v) =>
            setEmbedType(
              (v || EmbedCodeTypes.audio) as EmbedCode['type']
            )
          }
          label='Embed type'
          placeholder='Select a type'
          value={embedCodeIframe?.type}
          attributes={{
            hidden:
              !embedCodeIframe || embedCodeIframe?.host !== 'youtube',
            required: true,
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
            hidden: !embedCodeIframe,
            required: true,
            name: `${namePrefix}contentType`
          }}
        />
      </div>
      <Input
        attributes={{
          maxLength: MAX_STRING_LENGTH_SHORT,
          name: `${namePrefix}caption`,
          placeholder: 'Video by Artist Name (2024)',
          type: embedCodeIframe?.src ? 'text' : 'hidden'
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
    </>
  )
}
