import NextLink from 'next/link'
import { useId, useState } from 'react'
import type { z } from 'zod'

import type { createLinkSchema } from '@/lib/links/schemas'
import { linkTypes } from '@/lib/links/schemas'
import type { Link } from '@/lib/links/types'
import styles from '@/ui/form/form.module.scss'
import { Input } from '@/ui/form/input'
import { Select } from '@/ui/form/select'

const linkTypeOptions = [...linkTypes]

interface LinkProps {
  errors?: z.inferFlattenedErrors<
    typeof createLinkSchema
  >['fieldErrors']
  index?: number
  link?: Partial<Link>
}

export const EditLink = ({ errors, index, link }: LinkProps) => {
  const [type, setType] = useState<string | undefined>(
    link?.type || undefined
  )
  const namePrefix =
    typeof index === 'number' ? `links[${index}].` : ''
  const pressControlsId = useId()

  return (
    <>
      <Input
        attributes={{
          maxLength: 255,
          name: `${namePrefix}url`,
          placeholder: 'https://example.com',
          required: true,
          type: 'url'
        }}
        defaultValue={link?.url}
        errors={errors?.url}
        label='Link url'
      />

      <Input
        attributes={{
          maxLength: 255,
          name: `${namePrefix}title`,
          placeholder: 'Title'
        }}
        defaultValue={link?.title}
        errors={errors?.title}
        label='Title'
      />

      <Select
        attributes={{
          name: `${namePrefix}type`,
          'aria-controls': pressControlsId,
          'aria-expanded': type === 'press'
        }}
        label='Type'
        onChange={setType}
        options={linkTypeOptions}
        placeholder='Select link type'
        value={type}
      />

      <fieldset
        className={styles['checkbox-group']}
        hidden={type !== 'press'}
        id={pressControlsId}
      >
        <legend>Press link details</legend>
        <p>
          {'Press links are automatically shown on your '}
          <NextLink href='/about' target='_blank'>
            /about
          </NextLink>{' '}
          page, and can include additional data like an attribution
          and a quotation.
        </p>

        <Input
          attributes={{
            maxLength: 255,
            name: `${namePrefix}attribution`,
            placeholder: 'New York Times'
          }}
          defaultValue={link?.attribution}
          description='The name of the publication or link source.'
          errors={errors?.attribution}
          label='Attribution'
        />
        <Input
          as='textarea'
          attributes={{
            maxLength: 255,
            name: `${namePrefix}quotation`,
            placeholder: 'One of New York’s most influential artists'
          }}
          description='A short quote from the link, if applicable.'
          defaultValue={link?.quotation}
          errors={errors?.quotation}
          label='Quotation'
        />
        <Input
          attributes={{
            name: `${namePrefix}publishDate`,
            placeholder: 'YYYY-MM-DD',
            type: 'date'
          }}
          defaultValue={
            link?.publishDate
              ? new Date(link.publishDate).toISOString().split('T')[0]
              : ''
          }
          label='Publish date'
        />
      </fieldset>

      {link?.id && (
        <Input
          attributes={{
            name: `${namePrefix}id`,
            type: 'hidden'
          }}
          defaultValue={link.id}
          label='Link ID'
        />
      )}
    </>
  )
}
