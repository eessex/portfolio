import { useEffect, useState } from 'react'
import type { z } from 'zod'

import type {
  createImageSchema,
  Image
} from '@/lib/images/schemas/db'
import { imageTypes } from '@/lib/images/schemas/db'
import { imageAspect } from '@/lib/images/util'
import { MAX_STRING_LENGTH_SHORT } from '@/lib/schemas/primitives'
import {
  DisclosureDetails,
  useDisclosureDetails
} from '@/ui/form/disclosure-details'
import { FileInputImage } from '@/ui/form/file-input-image'
import styles from '@/ui/form/form.module.scss'
import { Input } from '@/ui/form/input'
import { Select } from '@/ui/form/select'
import { useNamePrefix } from '@/ui/item-picker/name-prefix'

const imageTypeOptions = [...imageTypes]

interface EditImageProps {
  errors?: z.inferFlattenedErrors<
    typeof createImageSchema
  >['fieldErrors']
  image?: Partial<Image>
  isRequired?: boolean
  /** Only the site icon and logo pickers take an SVG */
  isSvgAllowed?: boolean
  /**
   * Reports when a file goes from unparsed/absent to
   * successfully parsed or back.
   */
  onReadyChange?: (isReady: boolean) => void
}

export const EditImage = ({
  errors,
  image,
  isRequired = true,
  isSvgAllowed,
  onReadyChange
}: EditImageProps) => {
  const [type, setType] = useState<string | undefined>(
    image?.type || undefined
  )
  const [formImage] = useState<Partial<Image>>(image || {})
  const savedAspect = formImage.url
    ? imageAspect(formImage)
    : undefined
  const [aspectRatio, setAspectRatio] = useState<number | undefined>(
    savedAspect
  )
  const namePrefix = useNamePrefix()

  const { id, url } = (formImage || {}) as Image

  function onFileChange(
    _filename: string,
    aspectRatio: number | undefined
  ) {
    setAspectRatio(aspectRatio || savedAspect)
  }
  const isImageSet = !!aspectRatio
  const disclosure = useDisclosureDetails({
    isRevealed: isImageSet,
    isKeptWithContent: true
  })
  const { id: detailsFieldsetId, isExpanded } = disclosure

  useEffect(() => {
    onReadyChange?.(isImageSet)
  }, [isImageSet, onReadyChange])

  return (
    <>
      <FileInputImage
        ariaControls={detailsFieldsetId}
        isExpanded={isExpanded}
        attributes={{
          name: `${namePrefix}file`,
          // Required when isRequired, or once the form is touched.
          // Meta fields can't be saved without a file.
          required: isRequired || isExpanded,
          'aria-controls': detailsFieldsetId,
          'aria-expanded': isExpanded
        }}
        validationText='4MB size limit' // FIXME: use const
        image={formImage}
        isReplaceable={!id}
        isSvgAllowed={isSvgAllowed}
        label='Upload new image'
        onChange={onFileChange}
        isLabelHidden={!isExpanded}
      />
      <DisclosureDetails {...disclosure} legend='Image details'>
        {/* an existing image's url, which validation requires; its file never changes */}
        {url?.length > 0 && id && (
          <input
            type='hidden'
            name={`${namePrefix}url`}
            defaultValue={url}
          />
        )}
        <Input
          attributes={{
            maxLength: MAX_STRING_LENGTH_SHORT,
            name: `${namePrefix}caption`,
            placeholder: 'Caption'
          }}
          defaultValue={formImage?.caption}
          description='Visible text or attribution displayed under the image, adds context or storytelling.'
          errors={errors?.caption}
          label='Caption'
        />
        <Input
          attributes={{
            maxLength: MAX_STRING_LENGTH_SHORT,
            name: `${namePrefix}alt`,
            placeholder: 'Alt text'
          }}
          defaultValue={formImage?.alt}
          description='Hidden text for screen readers and search engines that describes exactly what is shown in the image.'
          errors={errors?.alt}
          label='Alt text'
        />
        <div className={styles['input-group']}>
          <Input
            attributes={{
              maxLength: MAX_STRING_LENGTH_SHORT,
              name: `${namePrefix}title`,
              placeholder: 'Title'
            }}
            defaultValue={formImage?.title}
            description='Used for internal search.'
            label='Title'
          />
          <Select
            attributes={{
              name: `${namePrefix}type`
            }}
            errors={errors?.type}
            label='Type'
            onChange={setType}
            options={imageTypeOptions}
            placeholder='Select image type'
            description='Used for internal search.'
            value={type}
          />
        </div>
      </DisclosureDetails>
    </>
  )
}
