import type { FocusEvent } from 'react'
import { useEffect, useId, useRef, useState } from 'react'
import type { z } from 'zod'

import { checkIfImageExists } from '@/lib/images/data'
import type {
  createImageSchema,
  Image
} from '@/lib/images/schemas/db'
import { imageTypes } from '@/lib/images/schemas/db'
import { MAX_STRING_LENGTH_SHORT } from '@/lib/schemas/primitives'
import { Checkbox } from '@/ui/form/checkbox'
import { FileInputImage } from '@/ui/form/file-input-image'
import styles from '@/ui/form/form.module.scss'
import { Input } from '@/ui/form/input'
import { Select } from '@/ui/form/select'
import { useNamePrefix } from '@/ui/item-picker/name-prefix'

const imageTypeOptions = [...imageTypes]

// Whether every visible control in the details fieldset is empty.
// Hidden inputs (aspect/url bookkeeping fields) don't count as user data.
function isDetailsEmpty(fieldset: HTMLFieldSetElement): boolean {
  const controls = fieldset.querySelectorAll<
    HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
  >('input:not([type="hidden"]), select, textarea')
  for (const control of controls) {
    if (
      control instanceof HTMLInputElement &&
      control.type === 'checkbox'
    ) {
      if (control.checked) return false
    } else if (control.value.trim() !== '') {
      return false
    }
  }
  return true
}

interface EditImageProps {
  errors?: z.inferFlattenedErrors<
    typeof createImageSchema
  >['fieldErrors']
  image?: Partial<Image>
  /**
   * Hides the "Press Image Details" fieldset (the About-page
   * visibility checkbox, shown only when type is 'press') for
   * contexts where press-image semantics don't apply, e.g. images
   * attached to a published edition.
   */
  isPressFieldsetHidden?: boolean
  isRequired?: boolean
  /**
   * Reports when a file goes from unparsed/absent to
   * successfully parsed or back.
   */
  onReadyChange?: (isReady: boolean) => void
}

export const EditImage = ({
  errors,
  image,
  isPressFieldsetHidden,
  isRequired = true,
  onReadyChange
}: EditImageProps) => {
  const [type, setType] = useState<string | undefined>(
    image?.type || undefined
  )
  const [aspectRatio, setAspectRatio] = useState<number | undefined>(
    image?.aspect || undefined
  )
  const [isHiddenOnAboutPage, setIsHiddenOnAboutPage] = useState(
    !!image?.isHiddenOnAboutPage
  )
  const [formImage, setFormImage] = useState<Partial<Image>>(
    image || {}
  )
  const [detailsExpanded, setDetailsExpanded] = useState(false)
  const detailsFieldsetRef = useRef<HTMLFieldSetElement>(null)
  const namePrefix = useNamePrefix()

  const { id, url } = (formImage || {}) as Image

  async function onFileChange(
    filename: string,
    aspectRatio: number | undefined,
    _isDirty?: boolean
  ) {
    const aspectRatioValue = aspectRatio || formImage.aspect
    setAspectRatio(aspectRatioValue)

    if (
      !filename &&
      !aspectRatioValue &&
      detailsFieldsetRef.current &&
      isDetailsEmpty(detailsFieldsetRef.current)
    ) {
      setDetailsExpanded(false)
    }

    if (filename) {
      try {
        if (image?.url) {
          const urlPath = image.url.split('/images/')[1]
          const isProbablyExisting =
            urlPath &&
            urlPath === filename &&
            aspectRatio === image.aspect
          if (isProbablyExisting) return
        }
        const existingImage = await checkIfImageExists(filename)
        if (existingImage) {
          if (id && existingImage.id !== id) {
            alert(
              'An image with this URL already exists, use a unique filename.'
            )
          } else if (!id) {
            const confirmed = confirm(
              'This image URL already exists. Confirm to edit the existing image. Cancel to choose another image with a unique filename.'
            )
            if (confirmed) {
              setFormImage(existingImage)
              setAspectRatio(existingImage.aspect)
            }
          }
        }
      } catch (error) {
        console.error('Error checking if image exists:', error)
      }
    }
  }
  const controlledCheckboxId = useId()
  const detailsFieldsetId = useId()
  const hasImage = !!aspectRatio
  const isExpanded = hasImage || detailsExpanded

  useEffect(() => {
    onReadyChange?.(hasImage)
  }, [hasImage, onReadyChange])

  function onDetailsBlur(e: FocusEvent<HTMLFieldSetElement>) {
    if (!hasImage && isDetailsEmpty(e.currentTarget)) {
      setDetailsExpanded(false)
    }
  }

  return (
    <>
      <FileInputImage
        ariaControls={detailsFieldsetId}
        ariaExpanded={isExpanded}
        attributes={{
          accept: 'image/*',
          name: `${namePrefix}file`,
          // Required when isRequired, or once the form is touched.
          // Meta fields can't be saved without a file.
          required: isRequired || isExpanded,
          'aria-controls': detailsFieldsetId,
          'aria-expanded': isExpanded
        }}
        validationText='1MB size limit.'
        image={formImage}
        label='Upload new image'
        onChange={onFileChange}
        isLabelHidden
      />
      <fieldset
        ref={detailsFieldsetRef}
        hidden={!isExpanded}
        className={isExpanded ? 'expanded' : undefined}
        id={detailsFieldsetId}
        onChange={() => setDetailsExpanded(true)}
        onBlur={onDetailsBlur}
      >
        <legend className='visually-hidden'>Image details</legend>
        {aspectRatio && (
          <Input
            attributes={{
              name: `${namePrefix}aspect`,
              type: 'hidden'
            }}
            errors={errors?.aspect}
            label='Aspect Ratio'
            value={aspectRatio}
          />
        )}
        {/* keep a record of existing image files so we can delete them from s3 */}
        {url?.length > 0 && id && (
          <Input
            attributes={{
              maxLength: MAX_STRING_LENGTH_SHORT,
              name: `${namePrefix}url`,
              placeholder:
                'https://aws.s3.bucket/images/your-image.jpg',
              required: true,
              type: 'hidden'
            }}
            defaultValue={url}
            description='The url of AWS S3 image location.'
            errors={errors?.url}
            label='Image url'
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
              name: `${namePrefix}type`,
              'aria-controls': controlledCheckboxId,
              'aria-expanded': type === 'press'
            }}
            label='Type'
            onChange={setType}
            options={imageTypeOptions}
            placeholder='Select image type'
            description='Used for internal search.'
            value={type}
          />
        </div>
        {!isPressFieldsetHidden && (
          <fieldset hidden={type !== 'press'}>
            <legend>Press Image Details</legend>
            <p>
              Press images are displayed on the about page by default.
            </p>
            <Checkbox
              attributes={{
                hidden: type !== 'press',
                name: `${namePrefix}isHiddenOnAboutPage`
              }}
              controlledId={controlledCheckboxId}
              isChecked={isHiddenOnAboutPage}
              label='Hide this image on the About page.'
              onChange={() =>
                setIsHiddenOnAboutPage(!isHiddenOnAboutPage)
              }
            />
          </fieldset>
        )}
      </fieldset>
    </>
  )
}
