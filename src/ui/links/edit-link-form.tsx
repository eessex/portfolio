import { useEffect, useId, useRef, useState } from 'react'
import type { z } from 'zod'

import { EmbedCodeHosts } from '@/lib/embed-codes/schemas/db'
import { findSocialLink } from '@/lib/links/actions'
import {
  type createLinkSchema,
  type Link,
  LinkTypes,
  linkTypes
} from '@/lib/links/schemas/db'
import {
  httpsUrlMessage,
  httpsUrlPattern,
  isHttpsUrl,
  MAX_STRING_LENGTH_SHORT
} from '@/lib/schemas/primitives'
import { embedCodeHostLabel } from '@/ui/embed-codes/embed-code-details'
import { extractHostFromUrl } from '@/ui/embed-codes/util'
import {
  DisclosureDetails,
  useDisclosureDetails
} from '@/ui/form/disclosure-details'
import styles from '@/ui/form/form.module.scss'
import { Input } from '@/ui/form/input'
import { Select } from '@/ui/form/select'
import { toDateInputValue } from '@/ui/format/dates'
import { useNamePrefix } from '@/ui/item-picker/name-prefix'

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

/** A social link's name from its url's embed code host, if supported. */
function inferredSocialLinkName(url: string) {
  const host = extractHostFromUrl(url)
  return host === EmbedCodeHosts.unknown
    ? undefined
    : embedCodeHostLabel(host)
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
   * A footer link: just the url and a required name, with no type
   * select (the parent saves the link as social).
   */
  isSocial?: boolean
  /** Reports the existing-url lookup in flight. */
  onBusyChange?: (isBusy: boolean) => void
  /**
   * Called with a saved social link that has the url entered and is
   * named for its host (e.g. "Bandcamp"); a custom-named one isn't
   * matched, so the draft creates a new link.
   */
  onExistingMatch?: (link: Link) => void
}

export const EditLink = ({
  errors,
  isRequired = true,
  link,
  isPress,
  isSocial,
  onBusyChange,
  onExistingMatch
}: LinkProps) => {
  const [type, setType] = useState<string | undefined>(
    link?.type || undefined
  )
  // Reveals the secondary fields when the url is valid, not on
  // every keystroke. Avoids the form jumping into view mid-typing.
  const [isUrlFilled, setIsUrlFilled] = useState(!!link?.url)
  const namePrefix = useNamePrefix()
  const pressControlsId = useId()
  const disclosure = useDisclosureDetails({ isRevealed: isUrlFilled })
  // Browsers don't reliably report insertReplacementText for
  // autocomplete/autofill (see bulkInputTypes below), so the primary
  // signal is length: any change of more than one character is
  // treated as a bulk insert worth checking immediately, leaving
  // single-character deltas (regular typing) to the blur handler.
  const prevUrlLengthRef = useRef((link?.url ?? '').length)

  // only the latest lookup may report; bumped on unmount too
  const lookupSeq = useRef(0)
  // the url last checked: skips repeat checks, and tells Enter
  // whether the form is current
  const checkedUrl = useRef(link?.url)
  const isLookingUp = useRef(false)

  const titleRef = useRef<HTMLInputElement | null>(null)
  // a typed name is kept; only a blank or still auto-filled one changes
  const autoFilledTitle = useRef<string | undefined>(undefined)

  function fillSocialLinkName(url: string) {
    const input = titleRef.current
    if (!input) return
    // a cleared new draft reads as blank, its hidden name included
    if (!link && !url.trim()) {
      input.value = ''
      autoFilledTitle.current = ''
      return
    }
    if (input.value && input.value !== autoFilledTitle.current) return
    const name = isHttpsUrl(url)
      ? (inferredSocialLinkName(url) ?? '')
      : ''
    input.value = name
    autoFilledTitle.current = name
  }

  useEffect(() => {
    const seq = lookupSeq
    return () => {
      seq.current++
    }
  }, [])

  // drops a lookup for an earlier url
  function cancelLookup() {
    lookupSeq.current++
    if (!isLookingUp.current) return
    isLookingUp.current = false
    onBusyChange?.(false)
  }

  function onUrlValidity(value: string) {
    if (value === checkedUrl.current) return
    checkedUrl.current = value
    cancelLookup()
    const isValid = isHttpsUrl(value)
    if (isSocial) fillSocialLinkName(value)
    // only a host-named link can match, so other hosts skip the lookup
    const hostName =
      onExistingMatch && isValid
        ? inferredSocialLinkName(value)
        : undefined
    if (!hostName) {
      setIsUrlFilled(isValid)
      return
    }
    // the lookup expands the form on no match
    void lookUpExistingUrl(value, hostName, lookupSeq.current)
  }

  async function lookUpExistingUrl(
    value: string,
    hostName: string,
    seq: number
  ) {
    isLookingUp.current = true
    onBusyChange?.(true)
    let match: Link | undefined
    try {
      match = await findSocialLink(value, hostName)
    } catch {
      // no match: the draft just creates a new link
    }
    if (seq !== lookupSeq.current) return
    isLookingUp.current = false
    onBusyChange?.(false)
    // read now: the name may have changed while pending
    const name = titleRef.current?.value.trim().toLowerCase()
    const isCustomNamed = !!name && name !== hostName.toLowerCase()
    // expanded only on no match, so a matched draft doesn't flash open
    if (match && !isCustomNamed) onExistingMatch?.(match)
    else setIsUrlFilled(true)
  }

  function onUrlBlur(event: React.FocusEvent<HTMLInputElement>) {
    onUrlValidity(event.target.value)
  }

  // Typing reveals the form only on blur, so Enter on a typed url
  // reveals it instead of submitting the parent form without it.
  function onUrlKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (event.key !== 'Enter') return
    const { value } = event.currentTarget
    if (value === checkedUrl.current || !isHttpsUrl(value)) return
    event.preventDefault()
    onUrlValidity(value)
  }

  function onUrlChange(event: React.ChangeEvent<HTMLInputElement>) {
    const length = event.target.value.length
    const delta = Math.abs(length - prevUrlLengthRef.current)
    prevUrlLengthRef.current = length

    const inputType = (event.nativeEvent as InputEvent).inputType
    const isBulkChange = delta > 1 || bulkInputTypes.has(inputType)
    if (!isBulkChange) {
      // typing past a looked-up url: its answer no longer applies,
      // blur or Enter checks the new one
      if (checkedUrl.current !== undefined) {
        checkedUrl.current = undefined
        cancelLookup()
      }
      return
    }

    onUrlValidity(event.target.value)
  }

  // Press-picker links require their citation fields, once the url
  // reveals them (a hidden required field would block the parent form).
  const isCitationRequired = !!isPress && isUrlFilled

  const titleInput = (
    <Input
      attributes={{
        maxLength: MAX_STRING_LENGTH_SHORT,
        name: `${namePrefix}title`,
        placeholder: isSocial ? 'Instagram' : 'Title',
        required: isCitationRequired || (!!isSocial && isUrlFilled)
      }}
      defaultValue={link?.title}
      errors={errors?.title}
      label={isSocial ? 'Name' : 'Title'}
      ref={(el) => {
        titleRef.current = el
      }}
    />
  )

  return (
    <>
      <Input
        attributes={{
          'aria-controls': disclosure.id,
          'aria-expanded': isUrlFilled,
          maxLength: MAX_STRING_LENGTH_SHORT,
          name: `${namePrefix}url`,
          // `type=url` alone accepts any scheme
          pattern: httpsUrlPattern,
          placeholder: 'https://example.com',
          title: httpsUrlMessage,
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
        onKeyDown={onUrlKeyDown}
        isLabelHidden={!isUrlFilled}
      />

      <DisclosureDetails {...disclosure} legend='Link details'>
        {isPress || isSocial ? (
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
        {!isSocial && (
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
                  maxLength: MAX_STRING_LENGTH_SHORT,
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
                maxLength: MAX_STRING_LENGTH_SHORT,
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
        )}
      </DisclosureDetails>
    </>
  )
}
