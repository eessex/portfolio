import styles from '@/ui/form/form.module.scss'
import { Input, type InputType } from '@/ui/form/input'
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/outline'
import type { EmbedCode } from '@/lib/definitions'
import { useCallback, useRef, useState } from 'react'

interface EmbedCodeProps {
  embed?: EmbedCode,
  index?: number,
  isFielset?: boolean,
  ref?: (el: InputType) => InputType | null,
  onRemoveEmbed?: (index: number) => void
}

export const EditEmbedCodeFieldset = ({ embed, index, ref, onRemoveEmbed }: EmbedCodeProps) => {
  return (
    <fieldset key={index}>
      <legend className='visually-hidden'>
        {`Embed code: ${embed?.title || index || 0 + 1}`}
      </legend>

      <EditEmbedCode embed={embed} index={index} ref={ref} onRemoveEmbed={onRemoveEmbed} />

      {embed && !embed.iframe && onRemoveEmbed && index && (
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

export const EditEmbedCode = ({ embed, index, ref, onRemoveEmbed }: EmbedCodeProps) => {
  const hasIndex = typeof index === 'number' && index >= 0
  return (
    <>
      <div>
        <Input
          label='Embed iframe code'
          description='Paste the full iframe embed code from a service like YouTube, Bandcamp, or Spotify'
          defaultValue={embed?.iframe}
          isTextarea={!embed?.id}
          ref={ref}
          attributes={{
            autoFocus: !embed?.iframe && !embed?.id,
            maxLength: 1500,
            name: hasIndex ? `embedCode[${index}].iframe` : 'iframe',
            placeholder: '<iframe></iframe>',
            required: true,
            type: embed?.id && hasIndex ? 'hidden' : undefined
          }}
        />
        {embed?.iframe.length && onRemoveEmbed && index && (
          <figure>
            <div dangerouslySetInnerHTML={{ __html: embed.iframe }} />
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
        defaultValue={embed?.caption}
        attributes={{
          maxLength: 255,
          name: hasIndex ? `embedCode[${index}].caption` : 'caption',
          placeholder: 'Caption'
        }}
      />
      <Input
        label='Title'
        description='Used for internal search only, never displayed publicly'
        defaultValue={embed?.title}
        attributes={{
          maxLength: 255,
          name: hasIndex ? `embedCode[${index}].title` : 'title',
          placeholder: 'Title'
        }}
      />
      {embed?.id && (
        <Input
          label='Embed code ID'
          defaultValue={embed.id}
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
  embeds
}: {
  embeds: EmbedCode[]
}) => {
  const initialEmbeds = embeds || []
  const [embedList, setEmbedList] = useState(initialEmbeds)
  const inputRefs = useRef<InputType[]>([])

  const addToRefs = useCallback((el: InputType | null) => {
    if (!el || inputRefs.current.includes(el)) return null
    inputRefs.current.push(el)
    return el
  }, [])

  function handleAddEmbed () {
    // Logic to add a new embed
    const newEmbed = { iframe: '', caption: '', id: '' }
    if (!embedList.some(embed => (!embed.iframe && !embed.caption && !embed.id))) {
      setEmbedList([...embedList, newEmbed])
    } else {
      const lastIndex = embedList.length - 1
      inputRefs.current[lastIndex]?.focus()
    }
  }

  function handleRemoveEmbed (index: number) {
    const updatedEmbeds = [...embedList]
    updatedEmbeds.splice(index, 1)
    setEmbedList(updatedEmbeds)
  }

  return (
    <fieldset className={styles['link-group']}>
      <legend>Embeds</legend>
      {embedList?.map((embed, index) => (
        <EditEmbedCode key={index} embed={embed} index={index} ref={addToRefs} onRemoveEmbed={handleRemoveEmbed} />
      ))}

      <button type='button' className='button button-secondary text-sm' onClick={handleAddEmbed}>
        <PlusIcon />Add new embed
      </button>
    </fieldset>
  )
}
