import { XMarkIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'

import type { EmbedCode } from '@/lib/embed-codes/types'
import { Input } from '@/ui/form/input'

interface EmbedCodeProps {
  embedCode?: EmbedCode
}

export const EditEmbedCode = ({ embedCode }: EmbedCodeProps) => {
  const [embedCodeIframe, setEmbedCodeIframe] = useState(embedCode?.iframe || '')

  function onReplaceIframe (newIframe: string) {
    if (embedCode?.id && !newIframe) {
      const confirmed = confirm('This embed code is used on existing pages. Changing it will update all pages it is used on. Are you sure you want to remove it?')
      if (!confirmed) return
    }

    setEmbedCodeIframe(newIframe)
  }

  const iFrameTextareaProps = {
    label: 'Embed iframe code',
    description: 'Paste the full iframe embed code from a service like YouTube, Bandcamp, or Spotify. iFrames are displayed at 100% width of their container, max 680px.',
    defaultValue: embedCodeIframe,
    attributes: {
      autoFocus: !embedCodeIframe && !embedCode?.id,
      maxLength: 1500,
      name: 'iframe',
      placeholder: '<iframe></iframe>',
      required: true
    }
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
                className='button icon-button'
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
        label='Caption'
        description='Displayed below the iframe wherever it appears'
        defaultValue={embedCode?.caption}
        attributes={{
          maxLength: 255,
          name: 'caption',
          placeholder: 'Caption'
        }}
      />
      <Input
        label='Title'
        description='Used for internal search only, never displayed publicly'
        defaultValue={embedCode?.title}
        attributes={{
          maxLength: 255,
          name: 'title',
          placeholder: 'Title'
        }}
      />
      {embedCode?.id && (
        <Input
          label='Embed Code ID'
          defaultValue={embedCode.id}
          attributes={{
            name: 'id',
            type: 'hidden'
          }}
        />
      )}
      {embedCode?.createdAt && (
        <Input
          label='Created At'
          defaultValue={embedCode.createdAt.toISOString()}
          attributes={{
            name: 'createdAt',
            type: 'hidden'
          }}
        />
      )}
    </>
  )
}
