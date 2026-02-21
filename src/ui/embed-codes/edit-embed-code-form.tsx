import {
  useCallback,
  useEffect,
  useState
} from 'react'
import type { z } from 'zod'

import type { createEmbedCodeSchema } from '@/lib/embed-codes/schemas'
import type { EmbedCode } from '@/lib/embed-codes/types'
import { EmbedCodeItem } from '@/ui/embed-codes/embed-code'
import { extractIframeParams } from '@/ui/embed-codes/util'
import { Input } from '@/ui/form/input'
import { Select } from '@/ui/form/select'
import { useToast } from '@/ui/toast/toast-context'
import { camelToSentence } from '@/ui/util'

interface EmbedCodeProps {
  embedCode?: Partial<EmbedCode>
  errors?: z.inferFlattenedErrors<typeof createEmbedCodeSchema>['fieldErrors']
  index?: number
}

export const EditEmbedCode = ({
  index,
  embedCode,
  errors
}: EmbedCodeProps) => {
  const [embedCodeIframe, setEmbedCodeIframe] = useState<ReturnType<typeof extractIframeParams> | null>(null)
  const [iframeInputValue, setIframeInputValue] = useState(embedCode?.iframe || '')
  const namePrefix = typeof index === 'number' ? `embedCodes[${index}].` : ''

  const { addErrorMessage } = useToast()

  const changeIframeValue = useCallback((value: string) => {
    if (!value) {
      setEmbedCodeIframe(null)
      setIframeInputValue('')
      return
    }

    try {
      const iframeData = extractIframeParams(value, true)
      setEmbedCodeIframe(iframeData)
      setIframeInputValue(value)
    } catch {
      addErrorMessage('Error parsing iframe.')
      setEmbedCodeIframe(null)
      setIframeInputValue('')
    }
  }, [addErrorMessage])

  useEffect(() => {
    changeIframeValue(embedCode?.iframe || '')
  }, [changeIframeValue, embedCode?.iframe])

  function onKeyDown (event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'v' && event.ctrlKey) {
      changeIframeValue(event.currentTarget.value)
    }
  }

  function onPaste (event: React.ClipboardEvent<HTMLInputElement>) {
    event.preventDefault()
    const text = event.clipboardData.getData('text/plain')
    changeIframeValue(text)
  }

  function onBeforeInput (event: React.FormEvent<HTMLInputElement>) {
    const native = event.nativeEvent as InputEvent

    const allowedTypes = [
      'insertFromPaste',
      'insertReplacementText' // autocomplete
    ]

    if (!allowedTypes.includes(native.inputType)) {
      event.preventDefault()
    }
  }

  function onChange (event: React.ChangeEvent<HTMLInputElement>) {
    changeIframeValue(event.target.value)
  }

  function onRemove () {
    changeIframeValue('')
  }

  function setEmbedType (type?: string) {
    if (!embedCodeIframe) return

    setEmbedCodeIframe({
      ...embedCodeIframe,
      type: type as EmbedCode['type']
    })
  }

  const defaultTitle = embedCode?.title
    ? embedCode?.title
    : embedCodeIframe && embedCodeIframe.host && embedCodeIframe.host !== 'youtube'
      ? `${camelToSentence(embedCodeIframe.host)}: ${embedCodeIframe.title || 'Untitled'}`
      : embedCodeIframe?.title || ''

  return (
    <>
      <div>
        {embedCodeIframe && (
          <EmbedCodeItem
            embedCode={{
              ...embedCode,
              iframe: iframeInputValue
            }}
            onRemove={onRemove}
          />
        )}
        <Input
          attributes={{
            maxLength: 1500,
            name: `${namePrefix}iframe`,
            placeholder: '<iframe></iframe>',
            required: true,
            readOnly: !!embedCodeIframe?.src,
            type: embedCodeIframe?.src ? 'hidden' : 'text'
          }}
          description='Paste a full iframe embed code. Supported services: Bandcamp, Mixcloud, Soundcloud, Spotify, YouTube. Others may work but no guarantees.'
          value={iframeInputValue}
          label='Embed iframe code'
          errors={errors?.iframe}
          onKeyDown={onKeyDown}
          onDrop={(e) => e.preventDefault()}
          onPaste={onPaste}
          onChange={onChange}
          onBeforeInput={onBeforeInput}
        />
      </div>
      <Select
        key={embedCodeIframe?.host}
        options={['audio', 'video']}
        onChange={setEmbedType}
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
          maxLength: 255,
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
          maxLength: 255,
          name: `${namePrefix}title`,
          placeholder: 'Hostname: descriptive title'
        }}
        defaultValue={defaultTitle}
        description='Used for internal search only, never displayed publicly.'
        errors={errors?.title}
        label='Title'
      />
      {embedCode?.id && (
        <Input
          attributes={{
            name: `${namePrefix}id`,
            type: 'hidden'
          }}
          defaultValue={embedCode.id}
          label='Embed Code ID'
        />
      )}
    </>
  )
}
