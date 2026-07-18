import { useId, useState } from 'react'
import type { z } from 'zod'

import { checkIfImageExists } from '@/lib/images/data'
import type {
  createImageSchema,
  Image
} from '@/lib/images/schemas/db'
import { MAX_STRING_LENGTH_SHORT } from '@/lib/schemas/primitives'
import { Checkbox } from '@/ui/form/checkbox'
import { FileInputImage } from '@/ui/form/file-input-image'
import { Input } from '@/ui/form/input'

interface EditImageProps {
  errors?: z.inferFlattenedErrors<
    typeof createImageSchema
  >['fieldErrors']
  image?: Partial<Image>
  index?: number
}

export const EditImage = ({
  errors,
  image,
  index
}: EditImageProps) => {
  const [isPress, setIsPress] = useState(!!image?.isPress)
  const [aspectRatio, setAspectRatio] = useState<number | undefined>(
    image?.aspect || undefined
  )
  const [isHiddenOnAboutPage, setIsHiddenOnAboutPage] = useState(
    !!image?.isHiddenOnAboutPage
  )
  const [formImage, setFormImage] = useState<Partial<Image>>(
    image || {}
  )
  const namePrefix =
    typeof index === 'number' ? `images[${index}].` : ''

  const { id, url } = (formImage || {}) as Image

  async function onFileChange(
    filename: string,
    aspectRatio: number | undefined
  ) {
    const aspectRatioValue = aspectRatio || formImage.aspect
    setAspectRatio(aspectRatioValue)
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

  return (
    <>
      <FileInputImage
        attributes={{
          accept: 'image/*',
          name: `${namePrefix}file`,
          required: true
        }}
        description='1MB size limit.'
        image={formImage}
        label='Upload new image'
        onChange={onFileChange}
      />
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
        description='Displayed below the image wherever it appears.'
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
        description='Describes the image for screen readers and search engines.'
        errors={errors?.alt}
        label='Alt text'
      />
      <fieldset>
        <legend>Press Image Details</legend>
        <p>
          Press images are displayed on the about page by default.
        </p>
        <Checkbox
          attributes={{
            'aria-controls': controlledCheckboxId,
            'aria-expanded': isPress,
            name: `${namePrefix}isPress`
          }}
          isChecked={isPress}
          label='This is a press image.'
          onChange={() => setIsPress(!isPress)}
        />
        <Checkbox
          attributes={{
            hidden: !isPress,
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
      <Input
        attributes={{
          maxLength: MAX_STRING_LENGTH_SHORT,
          name: `${namePrefix}title`,
          placeholder: 'Title'
        }}
        defaultValue={formImage?.title}
        description='Used for internal search only, never displayed publicly.'
        label='Title'
      />
    </>
  )
}
