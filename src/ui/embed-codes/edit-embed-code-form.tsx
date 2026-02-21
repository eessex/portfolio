import { XMarkIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'
import type { z } from 'zod'

import type { createEmbedCodeSchema } from '@/lib/embed-codes/schemas'
import type { EmbedCode } from '@/lib/embed-codes/types'
import { extractIframeData } from '@/ui/embed-codes/embed-code'
import { Input } from '@/ui/form/input'

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
  const [embedCodeIframe, setEmbedCodeIframe] = useState(extractIframeData(embedCode?.iframe || ''))
  const namePrefix = typeof index === 'number' ? `embedCodes[${index}].` : ''

  function onKeyDown (event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'v' && event.ctrlKey) {
      const iframeData = extractIframeData(event.currentTarget.value)
      setEmbedCodeIframe(iframeData)
    }
  }

  function onPaste (event: React.ClipboardEvent<HTMLInputElement>) {
    event.preventDefault()
    const text = event.clipboardData.getData('text/plain')
    const iframeData = extractIframeData(text)
    setEmbedCodeIframe(iframeData)
  }

  const defaultTitle = embedCode?.title ? embedCode.title : embedCodeIframe?.title ? `${embedCodeIframe?.hostname}: ${embedCodeIframe.title}` : embedCodeIframe?.hostname || ''

  return (
    <>
      <div>
        {embedCodeIframe && (
          <figure
            style={{
              width: '100%',
              position: 'relative',
              aspectRatio: `${embedCodeIframe.width} / ${embedCodeIframe.height}`
            }}
          >
            <iframe
              src={embedCodeIframe.src}
              loading='lazy'
              title='Embedded media preview'
              sandbox='allow-scripts allow-same-origin allow-presentation allow-popups'
              allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
              allowFullScreen
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                border: 0
              }}
            />

            <button
              title='Remove embed code'
              aria-label='Remove embed'
              type='button'
              onClick={() => setEmbedCodeIframe(null)}
              className='button-icon button-primary'
            >
              <XMarkIcon />
            </button>
          </figure>
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
          description='Paste the full iframe embed code from a service like YouTube, Bandcamp, or Spotify.'
          value={embedCodeIframe?.src || ''}
          label='Embed iframe code'
          errors={errors?.iframe}
          onKeyDown={onKeyDown}
          onDrop={(e) => e.preventDefault()}
          onPaste={onPaste}
          onChange={() => {}}
        />
      </div>
      <Input
        attributes={{
          maxLength: 255,
          name: `${namePrefix}caption`,
          placeholder: 'Caption'
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
          placeholder: 'Title'
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
