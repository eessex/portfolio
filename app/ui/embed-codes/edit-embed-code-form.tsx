import type { EmbedCode } from '@/lib/definitions'
import styles from '@/ui/form/form.module.scss'
import { Input, type InputType } from '@/ui/form/input'
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useCallback, useRef, useState } from 'react'

interface EmbedCodeProps {
  embedCode?: EmbedCode,
  index?: number,
  isFielset?: boolean,
  ref?: (el: InputType) => InputType | null,
  onRemoveEmbed?: (index: number) => void
}

export const EditEmbedCodeFieldset = ({ embedCode, index, ref, onRemoveEmbed }: EmbedCodeProps) => {
  return (
    <fieldset key={index}>
      <legend className='visually-hidden'>
        {`Embed code: ${embedCode?.title || index || 0 + 1}`}
      </legend>

      <EditEmbedCode embedCode={embedCode} index={index} ref={ref} onRemoveEmbed={onRemoveEmbed} />

      {embedCode && !embedCode.iframe && onRemoveEmbed && index && (
        <button
          title='Remove embed code'
          aria-label='Remove embed code'
          type='button'
          onClick={(() => onRemoveEmbed(index))}
          className='button'
        >
          <XMarkIcon />
        </button>
      )}
    </fieldset>
  )
}

export const EditEmbedCode = ({ embedCode, index, ref, onRemoveEmbed }: EmbedCodeProps) => {
  const hasIndex = typeof index === 'number' && index >= 0
  return (
    <>
      <div>
        <Input
          label='Embed iframe code'
          description='Paste the full iframe embed code from a service like YouTube, Bandcamp, or Spotify'
          defaultValue={embedCode?.iframe}
          isTextarea={!embedCode?.id}
          ref={ref}
          attributes={{
            autoFocus: !embedCode?.iframe && !embedCode?.id,
            maxLength: 1500,
            name: hasIndex ? `embedCode[${index}].iframe` : 'iframe',
            placeholder: '<iframe></iframe>',
            required: true,
            type: embedCode?.id && hasIndex ? 'hidden' : undefined
          }}
        />
        {embedCode?.iframe.length && onRemoveEmbed && index && (
          <figure>
            <div dangerouslySetInnerHTML={{ __html: embedCode.iframe }} />
            <button
              title='Remove embed code'
              aria-label='Remove embed'
              type='button'
              onClick={(() => onRemoveEmbed(index))}
              className='button'
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
          label='Embed code ID'
          defaultValue={embedCode.id}
          attributes={{
            name: hasIndex ? `embedCode[${index}].id` : 'id',
            type: 'hidden'
          }}
        />
      )}
    </>
  )
}

export const EditEmbedCodesFieldset = ({
  embedCodes
}: {
  embedCodes: EmbedCode[]
}) => {
  const initialEmbedCodes = embedCodes || []
  const [embedCodeList, setEmbedCodeList] = useState(initialEmbedCodes)
  const inputRefs = useRef<InputType[]>([])

  const addToRefs = useCallback((el: InputType | null) => {
    if (!el || inputRefs.current.includes(el)) return null
    inputRefs.current.push(el)
    return el
  }, [])

  function handleAddEmbed () {
    const newEmbed = { iframe: '', caption: '', id: '' }
    if (!embedCodeList.some(embedCode => (!embedCode.iframe && !embedCode.caption && !embedCode.id))) {
      setEmbedCodeList([...embedCodeList, newEmbed])
    } else {
      const lastIndex = embedCodeList.length - 1
      inputRefs.current[lastIndex]?.focus()
    }
  }

  function handleRemoveEmbed (index: number) {
    const updatedEmbedCodes = [...embedCodeList]
    updatedEmbedCodes.splice(index, 1)
    setEmbedCodeList(updatedEmbedCodes)
  }

  return (
    <fieldset className={styles['link-group']}>
      <legend>EmbedCodes</legend>
      {embedCodeList?.map((embedCode, index) => (
        <EditEmbedCode key={index} embedCode={embedCode} index={index} ref={addToRefs} onRemoveEmbed={handleRemoveEmbed} />
      ))}

      <button type='button' className='button button-secondary text-sm' onClick={handleAddEmbed}>
        <PlusIcon />Add new embed
      </button>
    </fieldset>
  )
}
