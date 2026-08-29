import { XMarkIcon } from '@heroicons/react/24/outline'
import { useEffect, useId, useRef, useState } from 'react'
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
  index?: number
  isRequired?: boolean
  link?: Partial<Link>
  /**
   * Reports when a link goes from unparsed/absent to
   * successfully parsed or back.
   */
  onReadyChange?: (isReady: boolean) => void
}

export const EditLink = ({
  errors,
  index,
  isRequired = true,
  link,
  onReadyChange
}: LinkProps) => {
  const [type, setType] = useState<string | undefined>(
    link?.type || undefined
  )
  // Reveals the secondary fields when the url is valid, not on
  // every keystroke. Avoids the form jumping into view mid-typing.
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
  // The url is uncontrolled (`defaultValue`), so clearing it on remove
  // has to go through the live DOM node — React can't reset it.
  const urlInputRef = useRef<HTMLInputElement | null>(null)

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

  function onRemove() {
    if (urlInputRef.current) urlInputRef.current.value = ''
    prevUrlLengthRef.current = 0
    setIsUrlFilled(false)
    setType(undefined)
  }

  return (
    <>
      <div className={styles['field-with-remove']}>
        <Input
          ref={(el) => {
            urlInputRef.current = el
          }}
          attributes={{
            'aria-controls': detailsFieldsetId,
            'aria-expanded': isUrlFilled,
            maxLength: 255,
            name: `${namePrefix}url`,
            placeholder: 'https://example.com',
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
          isLabelHidden
        />
        {isUrlFilled && (
          <button
            type='button'
            title='Remove link'
            aria-label='Remove link'
            aria-controls={detailsFieldsetId}
            aria-expanded={isUrlFilled}
            className='button-icon button-primary'
            onClick={onRemove}
          >
            <XMarkIcon />
          </button>
        )}
      </div>

      <fieldset
        hidden={!isUrlFilled}
        className={isUrlFilled ? 'expanded' : undefined}
        id={detailsFieldsetId}
      >
        <legend className='visually-hidden'>Link details</legend>

        <div className={styles['input-group']}>
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
          <Input
            attributes={{
              maxLength: 255,
              name: `${namePrefix}title`,
              placeholder: 'Title'
            }}
            defaultValue={link?.title}
            errors={errors?.title}
            label='Display text'
          />
        </div>
        <fieldset
          className={styles['checkbox-group']}
          hidden={type !== 'press'}
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
                placeholder: 'New York Times'
              }}
              defaultValue={link?.attribution}
              description='The name of the publication or link source.'
              errors={errors?.attribution}
              label='Attribution'
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
