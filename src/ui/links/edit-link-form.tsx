import { useId, useRef, useState } from 'react'
import type { z } from 'zod'

import {
  type createLinkSchema,
  type Link,
  linkTypes
} from '@/lib/links/schemas/db'
import styles from '@/ui/form/form.module.scss'
import { Input } from '@/ui/form/input'
import { Select } from '@/ui/form/select'

const linkTypeOptions = [...linkTypes]

// inputTypes that replace/insert a run of text in one shot — used to
// catch same-length or ±1-length paste/drop/autofill replacements the
// length-delta heuristic below would otherwise miss. Deliberately not
// relied on alone: browsers don't reliably report insertReplacementText
// for autocomplete/autofill, which is why the delta check exists.
const bulkInputTypes = new Set([
  'insertFromPaste',
  'insertFromPasteAsQuotation',
  'insertFromDrop',
  'insertReplacementText'
])

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
  // Reveals the secondary fields once the url is valid, rather than
  // on every keystroke — avoids the rest of the form jumping into
  // view while the admin is still mid-typing.
  const [isUrlFilled, setIsUrlFilled] = useState(!!link?.url)
  const namePrefix =
    typeof index === 'number' ? `links[${index}].` : ''
  const pressControlsId = useId()
  const detailsFieldsetId = useId()
  // Browsers don't reliably report insertReplacementText for
  // autocomplete/autofill (see bulkInputTypes below), so the primary
  // signal is length: any change of more than one character is
  // treated as a bulk insert worth checking immediately, leaving
  // single-character deltas (regular typing) to the blur handler.
  const prevUrlLengthRef = useRef((link?.url ?? '').length)

  function onUrlBlur(event: React.FocusEvent<HTMLInputElement>) {
    setIsUrlFilled(event.target.checkValidity())
  }

  function onUrlChange(event: React.ChangeEvent<HTMLInputElement>) {
    const length = event.target.value.length
    const delta = Math.abs(length - prevUrlLengthRef.current)
    prevUrlLengthRef.current = length

    const inputType = (event.nativeEvent as InputEvent).inputType
    const isBulkChange = delta > 1 || bulkInputTypes.has(inputType)
    if (!isBulkChange) return

    setIsUrlFilled(event.target.checkValidity())
  }

  return (
    <>
      <Input
        attributes={{
          'aria-controls': detailsFieldsetId,
          'aria-expanded': isUrlFilled,
          maxLength: 255,
          name: `${namePrefix}url`,
          placeholder: 'https://example.com',
          required: true,
          type: 'url'
        }}
        defaultValue={link?.url}
        errors={errors?.url}
        label='URL'
        onBlur={onUrlBlur}
        onChange={onUrlChange}
        isLabelHidden
      />

      <fieldset hidden={!isUrlFilled} id={detailsFieldsetId}>
        <legend className='visually-hidden'>Link details</legend>

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
          <legend className='visually-hidden'>
            Press link details
          </legend>
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
              placeholder:
                'One of New York’s most influential artists'
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
                ? new Date(link.publishDate)
                    .toISOString()
                    .split('T')[0]
                : ''
            }
            label='Publish date'
          />
        </fieldset>
      </fieldset>
    </>
  )
}
