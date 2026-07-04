import { useCallback, useState } from 'react'
import type { z } from 'zod'

import {
  type createEmbedCodeSchema,
  type EmbedCode,
  EmbedCodeTypes,
  embedCodeTypes
} from '@/lib/embed-codes/schemas/db'
import { MAX_STRING_LENGTH_SHORT } from '@/lib/schemas/primitives'
import { EmbedCodeItem } from '@/ui/embed-codes/embed-code'
import { extractIframeParams } from '@/ui/embed-codes/util'
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
  const [iframeInputValue, setIframeInputValue] = useState(
    embedCode?.iframe || ''
  )
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

    setEmbedCodeIframe({
      ...embedCodeIframe,
      type
    })
  }

  const defaultTitle =
    embedCode?.title || embedCodeIframe?.title || 'Untitled'

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
            errors={errors?.iframe}
            onKeyDown={onKeyDown}
            onDrop={(e) => e.preventDefault()}
            onPaste={onPaste}
            onChange={onChange}
            onBeforeInput={onBeforeInput}
          />
        )}
      </div>
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
          hidden: !embedCodeIframe,
          required: true,
          name: `${namePrefix}type`
        }}
      />
      <Input
        attributes={{
          maxLength: MAX_STRING_LENGTH_SHORT,
          name: `${namePrefix}caption`,
          placeholder: 'Video by Artist Name (2024)'
        }}
        defaultValue={embedCode?.caption}
        description='Displayed below the iframe wherever it appears.'
        errors={errors?.caption}
        label='Caption'
      />
      <Input
        attributes={{
          maxLength: MAX_STRING_LENGTH_SHORT,
          name: `${namePrefix}title`,
          placeholder: 'Music video for Artist Name - Song Name'
        }}
        defaultValue={defaultTitle}
        description='Used for internal search only, not displayed publicly.'
        errors={errors?.title}
        label='Title'
      />
      {embedCodeIframe?.src && (
        <Input
          attributes={{
            name: `${namePrefix}src`
            // type: 'hidden'
          }}
          defaultValue={embedCodeIframe.src}
          label='Embed Code Source'
        />
      )}
      {embedCodeIframe?.host && (
        <Input
          attributes={{
            name: `${namePrefix}host`,
            // type: 'hidden',
            required: true
          }}
          defaultValue={embedCodeIframe.host}
          label='Embed Code Host'
        />
      )}
    </>
  )
}
