import { XMarkIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'

import type {
  DashboardEmbedCode,
  EmbedCode
} from '@/lib/embed-codes/types'
import {
  Input,
  type InputAttributes,
  type InputProps,
  type InputType
} from '@/ui/form/input'
import { usedOnPages } from '@/ui/util'

interface EmbedCodeProps {
  embedCode?: EmbedCode | DashboardEmbedCode
  index?: number
  isFielset?: boolean
  ref?: InputProps<InputType>['ref']
}

export const EditEmbedCode = ({
  embedCode,
  index,
  ref
}: EmbedCodeProps) => {
  const hasIndex = typeof index === 'number' && index >= 0
  const isUsed = embedCode?.id ? usedOnPages(embedCode as DashboardEmbedCode).length > 0 : false
  const [iframeValue, setIframeValue] = useState(embedCode?.iframe || '')

  const iframeProps: InputProps<HTMLTextAreaElement> = {
    label: 'Embed iframe code',
    description: 'Paste the full iframe embed code from a service like YouTube, Bandcamp, or Spotify',
    ref,
    attributes: {
      maxLength: 1500,
      name: hasIndex ? `embedCode[${index}].iframe` : 'iframe',
      placeholder: '<iframe></iframe>',
      required: true
    }
  }

  function toHiddenInputProps (
    props: InputProps<HTMLTextAreaElement>
  ): InputProps<HTMLInputElement> {
    const attributes = {
      ...props.attributes, type: 'hidden'
    } as InputAttributes<HTMLInputElement>

    return {
      label: props.label,
      description: props.description,
      defaultValue: iframeValue,
      ref,
      attributes
    }
  }

  const savedIframeInputProps = iframeValue
    ? toHiddenInputProps(iframeProps)
    : undefined

  function onRemove () {
    if (isUsed) {
      const onConfirm = confirm('This embed code is used on one or more pages, replacing it here will also update this embed everywhere it is used.')
      if (!onConfirm) return
    }
    setIframeValue('')
  }

  return (
    <>
      <div>
        {savedIframeInputProps
          ? (
            <Input {...savedIframeInputProps} />
            )
          : (
            <Input
              {...iframeProps}
              as='textarea'
            />
            )}
        {iframeValue && (
          <figure>
            <div dangerouslySetInnerHTML={{ __html: iframeValue }} />
            <button
              title='Remove embed code'
              aria-label='Remove embed'
              type='button'
              onClick={onRemove}
              className='button icon-button'
            >
              <XMarkIcon />
            </button>
          </figure>
        )}
      </div>

      <Input
        label='Caption'
        description='Displayed below the iframe wherever it appears'
        defaultValue={embedCode?.caption}
        attributes={{
          maxLength: 255,
          name: hasIndex ? `embedCode[${index}].caption` : 'caption',
          placeholder: 'Caption'
        }}
      />

      <Input
        label='Title'
        description='Used for internal search only, never displayed publicly'
        defaultValue={embedCode?.title}
        attributes={{
          maxLength: 255,
          name: hasIndex ? `embedCode[${index}].title` : 'title',
          placeholder: 'Title'
        }}
      />

      {embedCode?.id && (
        <Input
          label='Embed Code ID'
          defaultValue={embedCode.id}
          attributes={{
            name: hasIndex ? `embedCode[${index}].id` : 'id',
            type: 'hidden'
          }}
        />
      )}

      {embedCode?.createdAt && (
        <Input
          label='Created At'
          defaultValue={embedCode.createdAt.toISOString()}
          attributes={{
            name: hasIndex ? `embedCode[${index}].createdAt` : 'createdAt',
            type: 'hidden'
          }}
        />
      )}
    </>
  )
}
