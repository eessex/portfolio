import { XMarkIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'
import type { z } from 'zod'

import type { createEmbedCodeSchema } from '@/lib/embed-codes/schemas'
import type { EmbedCode } from '@/lib/embed-codes/types'
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
  const [embedCodeIframe, setEmbedCodeIframe] = useState(embedCode?.iframe || '')
  const namePrefix = typeof index === 'number' ? `embedCodes[${index}].` : ''

  function onReplaceIframe (newIframe: string) {
    if (embedCode?.id && !newIframe) {
      const confirmed = confirm('This embed code is used on existing pages. Changing it will update all pages it is used on. Are you sure you want to remove it?')
      if (!confirmed) return
    }

    setEmbedCodeIframe(newIframe)
  }

  const iFrameTextareaProps = {
    attributes: {
      maxLength: 1500,
      name: `${namePrefix}iframe`,
      placeholder: '<iframe></iframe>',
      required: true
    },
    description: 'Paste the full iframe embed code from a service like YouTube, Bandcamp, or Spotify. iFrames are displayed at 100% width of their container, max 680px.',
    defaultValue: embedCodeIframe,
    label: 'Embed iframe code',
    errors: errors?.iframe
  }

  const iFrameHiddenProps = {
    ...iFrameTextareaProps,
    attributes: {
      ...iFrameTextareaProps.attributes,
      type: 'hidden',
      readOnly: true
    }
  }
  return (
    <>

      {embedCodeIframe.length
        ? (
          <div>
            <Input
              {...iFrameHiddenProps}
            />
            <figure>
              <div dangerouslySetInnerHTML={{ __html: embedCodeIframe }} />
              <button
                title='Remove embed code'
                aria-label='Remove embed'
                type='button'
                onClick={() => onReplaceIframe('')}
                className='button-icon button-primary'
              >
                <XMarkIcon />
              </button>
            </figure>
          </div>
          )
        : (
          <Input
            as='textarea'
            {...iFrameTextareaProps}
          />
          )}
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
        defaultValue={embedCode?.title}
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
      {embedCode?.createdAt && (
        <Input
          attributes={{
            name: `${namePrefix}createdAt`,
            type: 'hidden'
          }}
          defaultValue={embedCode.createdAt.toISOString()}
          label='Created At'
        />
      )}
    </>
  )
}
