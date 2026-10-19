import { useEffect, useId, useRef, useState } from 'react'
import type { z } from 'zod'

import {
  type createLinkSchema,
  type Link,
  LinkTypes,
  linkTypes
} from '@/lib/links/schemas/db'
import styles from '@/ui/form/form.module.scss'
import { Input } from '@/ui/form/input'
import { Select } from '@/ui/form/select'
import { useNamePrefix } from '@/ui/item-picker/name-prefix'
import { toDateInputValue } from '@/ui/util'

const linkTypeOptions = [...linkTypes]
const nonPressLinkTypeOptions = linkTypes.filter(
  (type) => type !== LinkTypes.press
)

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

function isValidHttpUrl(value: string): boolean {
  let parsed: URL
  try {
    parsed = new URL(value)
  } catch {
    return false
  }
  return parsed.protocol === 'http:' || parsed.protocol === 'https:'
}

interface LinkProps {
  errors?: z.inferFlattenedErrors<
    typeof createLinkSchema
  >['fieldErrors']
  isRequired?: boolean
  link?: Partial<Link>
  /**
   * Fixes the form to one side of the press/other split: `true` drops
   * the type select and always shows the press fields (the parent
   * saves the link as press), `false` drops `press` from the type
   * options. Omit to choose any type.
   */
  isPress?: boolean
  /**
   * Reports when a link goes from unparsed/absent to
   * successfully parsed or back.
   */
  onReadyChange?: (isReady: boolean) => void
}

export const EditLink = ({
  errors,
  isRequired = true,
  link,
  isPress,
  onReadyChange
}: LinkProps) => {
  const [type, setType] = useState<string | undefined>(
    link?.type || undefined
  )
  // Reveals the secondary fields when the url is valid, not on
  // every keystroke. Avoids the form jumping into view mid-typing.
  const [isUrlFilled, setIsUrlFilled] = useState(!!link?.url)
  const namePrefix = useNamePrefix()
  const pressControlsId = useId()
  const detailsFieldsetId = useId()
  // Browsers don't reliably report insertReplacementText for
  // autocomplete/autofill (see bulkInputTypes below), so the primary
  // signal is length: any change of more than one character is
  // treated as a bulk insert worth checking immediately, leaving
  // single-character deltas (regular typing) to the blur handler.
  const prevUrlLengthRef = useRef((link?.url ?? '').length)

  useEffect(() => {
    onReadyChange?.(isUrlFilled)
  }, [isUrlFilled, onReadyChange])

  function onUrlBlur(event: React.FocusEvent<HTMLInputElement>) {
    setIsUrlFilled(isValidHttpUrl(event.target.value))
  }

  function onUrlChange(event: React.ChangeEvent<HTMLInputElement>) {
    const length = event.target.value.length
    const delta = Math.abs(length - prevUrlLengthRef.current)
    prevUrlLengthRef.current = length

    const inputType = (event.nativeEvent as InputEvent).inputType
    const isBulkChange = delta > 1 || bulkInputTypes.has(inputType)
    if (!isBulkChange) return

    setIsUrlFilled(isValidHttpUrl(event.target.value))
  }

  // Press-picker links require their citation fields, once the url
  // reveals them (a hidden required field would block the parent form).
  const isCitationRequired = !!isPress && isUrlFilled

  const titleInput = (
    <Input
      attributes={{
        maxLength: 255,
        name: `${namePrefix}title`,
        placeholder: 'Title',
        required: isCitationRequired
      }}
      defaultValue={link?.title}
      errors={errors?.title}
      label='Display text'
    />
  )

  return (
    <>
      <Input
        attributes={{
          'aria-controls': detailsFieldsetId,
          'aria-expanded': isUrlFilled,
          maxLength: 255,
          name: `${namePrefix}url`,
          // `type=url` alone accepts any scheme; match `isValidHttpUrl`.
          pattern: 'https?://.+',
          placeholder: 'https://example.com',
          title: 'A URL starting with http:// or https://',
          // Required when isRequired, or once the form is touched.
          // Meta fields can't be saved without a url.
          required: isRequired || isUrlFilled,
          type: 'url'
        }}
        defaultValue={link?.url}
        errors={errors?.url}
        label='URL'
        onBlur={onUrlBlur}
        onChange={onUrlChange}
        isLabelHidden={!isUrlFilled}
      />

      <fieldset
        hidden={!isUrlFilled}
        className='boxed-details'
        id={detailsFieldsetId}
      >
        <legend className='visually-hidden'>Link details</legend>

        {isPress ? (
          titleInput
        ) : (
          <div className={styles['input-group']}>
            <Select
              attributes={{
                name: `${namePrefix}type`,
                'aria-controls': pressControlsId,
                'aria-expanded': type === 'press'
              }}
              errors={errors?.type}
              label='Type'
              onChange={setType}
              options={
                isPress === false
                  ? nonPressLinkTypeOptions
                  : linkTypeOptions
              }
              placeholder='Select link type'
              value={type}
            />
            {titleInput}
          </div>
        )}
        <fieldset
          className={styles['checkbox-group']}
          hidden={!isPress && type !== 'press'}
          id={pressControlsId}
        >
          <legend className='visually-hidden'>
            Press link details
          </legend>
          <div className={styles['input-group']}>
            <Input
              attributes={{
                maxLength: 255,
                name: `${namePrefix}attribution`,
                placeholder: 'New York Times',
                required: isCitationRequired
              }}
              defaultValue={link?.attribution}
              description='The publication title or link source.'
              errors={errors?.attribution}
              label='Attribution'
            />
            <Input
              attributes={{
                name: `${namePrefix}publishDate`,
                placeholder: 'YYYY-MM-DD',
                required: isCitationRequired,
                type: 'date'
              }}
              defaultValue={toDateInputValue(link?.publishDate)}
              errors={errors?.publishDate}
              label='Publish date'
              description='Press links are sorted by publish date.'
            />
          </div>
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
        </fieldset>
      </fieldset>
    </>
  )
}
