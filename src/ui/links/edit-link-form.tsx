import NextLink from 'next/link'
import {
  useId,
  useState
} from 'react'

import { linkTypes } from '@/lib/links/schemas'
import type { Link } from '@/lib/links/types'
import styles from '@/ui/form/form.module.scss'
import { Input } from '@/ui/form/input'
import { Select } from '@/ui/form/select'

const linkTypeOptions = [...linkTypes]

interface LinkProps {
  link?: Link
}

export const EditLink = ({ link }: LinkProps) => {
  const [type, setType] = useState<string | undefined>(link?.type || undefined)
  const pressControlsId = useId()

  return (
    <>
      <Input
        label='Link url'
        defaultValue={link?.url}
        attributes={{
          maxLength: 255,
          name: 'url',
          placeholder: 'https://example.com',
          required: true,
          type: 'url'
        }}
      />

      <Input
        label='Title'
        defaultValue={link?.title}
        attributes={{
          maxLength: 255,
          name: 'title',
          placeholder: 'Title'
        }}
      />
      <Select
        label='Type'
        value={type}
        onChange={setType}
        options={linkTypeOptions}
        placeholder='Select link type'
        attributes={{
          name: 'type',
          'aria-controls': pressControlsId,
          'aria-expanded': type === 'press'
        }}
      />

      {type === 'press' && (
        <fieldset
          className={styles['checkbox-group']}
          hidden={type !== 'press'}
          id={pressControlsId}
        >
          <legend>Press link details</legend>
          <p>
            {'Press links are automatically shown on your '}
            <NextLink
              href='/about'
              target='_blank'
            >
              /about
            </NextLink> page, and can include additional data like an attribution and a quotation.
          </p>
          <Input
            label='Attribution'
            description='The name of the publication or link source.'
            defaultValue={link?.attribution}
            attributes={{
              maxLength: 255,
              name: 'attribution',
              placeholder: 'New York Times'
            }}
          />
          <Input
            as='textarea'
            label='Quotation'
            description='A short quote from the link, if applicable.'
            defaultValue={link?.quotation}
            attributes={{
              maxLength: 255,
              name: 'quotation',
              placeholder: 'One of New York’s most influential artists'
            }}
          />
          <Input
            label='Publish date'
            defaultValue={link?.publishDate ? new Date(link.publishDate).toISOString().split('T')[0] : ''}
            attributes={{
              name: 'publishDate',
              placeholder: 'YYYY-MM-DD',
              type: 'date'
            }}
          />
        </fieldset>
      )}
      {link?.id && (
        <Input
          label='Link ID'
          defaultValue={link.id}
          attributes={{
            name: 'id',
            type: 'hidden'
          }}
        />
      )}
      {link?.createdAt && (
        <Input
          label='Created At'
          defaultValue={link.createdAt.toISOString()}
          attributes={{
            name: 'createdAt',
            type: 'hidden'
          }}
        />
      )}
    </>
  )
}
