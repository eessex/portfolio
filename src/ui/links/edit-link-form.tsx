import {
  PlusIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import clsx from 'clsx'
import NextLink from 'next/link'
import {
  useCallback,
  useRef,
  useState
} from 'react'

import { linkTypes } from '@/lib/links/schemas'
import type { Link } from '@/lib/links/types'
import styles from '@/ui/form/form.module.scss'
import {
  Input,
  type InputProps,
  type InputType
} from '@/ui/form/input'

import { Select } from '../form/select'

const linkTypeOptions = [...linkTypes]

interface LinkProps {
  link?: Link
  index?: number
  isFielset?: boolean
  ref?: InputProps<InputType>['ref']
  onRemoveLink?: (index: number) => void
}

export const EditLinkFieldset = ({
  link,
  index,
  ref,
  onRemoveLink
}: LinkProps) => {
  return (
    <fieldset key={index}>
      <legend className='visually-hidden'>
        {`Link: ${link?.title || index || 0 + 1}`}
      </legend>

      <EditLink
        link={link}
        index={index}
        ref={ref}
        onRemoveLink={onRemoveLink}
      />

      {link && !link.url && onRemoveLink && index && (
        <button
          title='Remove link'
          aria-label='Remove link'
          type='button'
          onClick={(() => onRemoveLink(index))}
          className='button'
        >
          <XMarkIcon />
        </button>
      )}
    </fieldset>
  )
}

export const EditLink = ({
  link,
  index,
  ref,
  onRemoveLink
}: LinkProps) => {
  const hasIndex = typeof index === 'number' && index >= 0
  const [type, setType] = useState<string | undefined>(link?.type || undefined)

  return (
    <>
      <div>
        <Input
          label='Link url'
          defaultValue={link?.url}
          ref={ref}
          attributes={{
            autoFocus: !link?.url && !link?.id,
            maxLength: 255,
            name: hasIndex ? `link[${index}].url` : 'url',
            placeholder: 'https://example.com',
            required: true,
            type: link?.id && hasIndex ? 'hidden' : 'url'
          }}
        />
        {/* FIXME: necessary? */}
        {link?.url.length && onRemoveLink && index && (
          <button
            title='Remove link'
            aria-label='Remove link'
            type='button'
            onClick={(() => onRemoveLink(index))}
            className='button'
          >
            <XMarkIcon />
          </button>
        )}
      </div>

      <Input
        label='Title'
        defaultValue={link?.title}
        attributes={{
          maxLength: 255,
          name: hasIndex ? `link[${index}].title` : 'title',
          placeholder: 'Title'
        }}
      />
      <Select
        label='Type'
        value={type}
        onChange={setType}
        options={linkTypeOptions}
        placeholder='Select link type'
        attributes={{ name: hasIndex ? `link[${index}].type` : 'type' }}
      />

      {type === 'press' && (
        <fieldset
          className={styles['checkbox-group']}
          aria-hidden={type !== 'press'}
          hidden={type !== 'press'}
        >
          <legend>Press link details</legend>
          <p>Press links are automatically shown on your
            <NextLink
              href='/about'
              target='_blank'
            >
              about
            </NextLink> page, and can include additional data like an attribution and a quotation.
          </p>
          <div className={clsx(styles['press-inputs'])}>
            <Input
              label='Attribution'
              description='The name of the publication or link source.'
              defaultValue={link?.attribution}
              attributes={{
                maxLength: 255,
                name: hasIndex ? `link[${index}].attribution` : 'attribution',
                placeholder: 'New York Times'
              }}
            />
            <Input
              label='Quotation'
              description='A short quote from the link, if applicable.'
              defaultValue={link?.quotation}
              as='textarea'
              attributes={{
                maxLength: 255,
                name: hasIndex ? `link[${index}].quotation` : 'quotation',
                placeholder: 'One of New York’s most influential artists'
              }}
            />
            <Input
              label='Publish date'
              defaultValue={link?.publishDate ? new Date(link.publishDate).toISOString().split('T')[0] : ''}
              attributes={{
                name: hasIndex ? `link[${index}].publishDate` : 'publishDate',
                placeholder: 'YYYY-MM-DD',
                type: 'date'
              }}
            />
          </div>
        </fieldset>
      )}
      {link?.id && (
        <Input
          label='Link ID'
          defaultValue={link.id}
          attributes={{
            name: hasIndex ? `link[${index}].id` : 'id',
            type: 'hidden'
          }}
        />
      )}
      {link?.createdAt && (
        <Input
          label='Created At'
          defaultValue={link.createdAt.toISOString()}
          attributes={{
            name: hasIndex ? `link[${index}].createdAt` : 'createdAt',
            type: 'hidden'
          }}
        />
      )}
    </>
  )
}

export const EditLinksFieldset = ({ links }: {
  links: Link[]
}) => {
  const initialLinks = links || []
  const [linkList, setLinkList] = useState(initialLinks)
  const inputRefs = useRef<InputType[]>([])

  const addToRefs = useCallback((el: InputType | null) => {
    if (!el || inputRefs.current.includes(el)) return null
    inputRefs.current.push(el)
    return el
  }, [])

  function handleAddLink () {
    const newLink = {
      url: '',
      title: '',
      id: '',
      tagIds: [],
      createdAt: new Date()
    }
    if (!linkList.some(link => (!link.url && !link.title && !link.id))) {
      setLinkList([...linkList, newLink])
    } else {
      const lastIndex = linkList.length - 1
      inputRefs.current[lastIndex]?.focus()
    }
  }

  function handleRemoveLink (index: number) {
    const updatedLinks = [...linkList]
    updatedLinks.splice(index, 1)
    setLinkList(updatedLinks)
  }

  return (
    <fieldset>
      <legend>Links</legend>
      {linkList?.map((link, index) => (
        <EditLink
          key={index}
          link={link}
          index={index}
          ref={addToRefs}
          onRemoveLink={handleRemoveLink}
        />
      ))}

      <button
        type='button'
        className='button button-secondary text-sm'
        onClick={handleAddLink}
      >
        <PlusIcon />Add new link
      </button>
    </fieldset>
  )
}
