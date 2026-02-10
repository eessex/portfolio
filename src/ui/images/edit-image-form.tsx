import {
  useId,
  useState
} from 'react'

import { checkIfImageExists } from '@/lib/images/actions'
import type { Image } from '@/lib/images/types'
import { Checkbox } from '@/ui/form/checkbox'
import { FileInputImage } from '@/ui/form/file-input-image'
import { Input } from '@/ui/form/input'

interface EditImageProps {
  image?: Partial<Image>
  index?: number
}

export const EditImage = ({
  image,
  index
}: EditImageProps) => {
  const [isPress, setIsPress] = useState(!!image?.isPress)
  const [aspectRatio, setAspectRatio] = useState<number | undefined>(image?.aspect || undefined)
  const [isHiddenOnAboutPage, setIsHiddenOnAboutPage] = useState(!!image?.isHiddenOnAboutPage)
  const [formImage, setFormImage] = useState<Partial<Image>>(image || {})
  const namePrefix = typeof index === 'number' ? `images[${index}].` : ''

  const {
    createdAt,
    id,
    url
  } = (formImage || {}) as Image

  async function onFileChange (filename: string, aspectRatio: number | undefined) {
    const aspectRatioValue = aspectRatio || formImage.aspect
    setAspectRatio(aspectRatioValue)
    if (filename) {
      try {
        if (image?.url) {
          const urlPath = image.url.split('/images/')[1]
          const isProbablyExisting = urlPath && urlPath === filename && aspectRatio === image.aspect
          if (isProbablyExisting) return
        }
        const existingImage = await checkIfImageExists(filename)
        if (existingImage) {
          if (id && existingImage.id !== id) {
            alert('An image with this URL already exists, use a unique filename.')
          } else if (!id) {
            const confirmed = confirm('This image URL already exists. Confirm to edit the existing image. Cancel to choose another image with a unique filename.')
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
        label='Upload new image'
        description='1MB size limit.'
        attributes={{
          accept: 'image/*',
          name: `${namePrefix}file`,
          required: true
        }}
        image={formImage}
        onChange={onFileChange}
      />
      {aspectRatio && (
        <Input
          label='Aspect Ratio'
          value={aspectRatio}
          attributes={{
            name: `${namePrefix}aspect`,
            type: 'hidden'
          }}
        />
      )}
      {/* keep a record of existing image files so we can delete them from s3 */}
      {url?.length > 0 && id && (
        <Input
          label='Image url'
          description='The url of AWS S3 image location.'
          defaultValue={url}
          attributes={{
            maxLength: 255,
            name: `${namePrefix}url`,
            placeholder: 'https://aws.s3.bucket/images/your-image.jpg',
            required: true,
            type: 'hidden'
          }}
        />
      )}
      <Input
        label='Caption'
        description='Displayed below the image wherever it appears.'
        defaultValue={formImage?.caption}
        attributes={{
          maxLength: 255,
          name: `${namePrefix}caption`,
          placeholder: 'Caption'
        }}
      />
      <fieldset>
        <legend>Press Image Details</legend>
        <p>Press images are displayed on the about page by default.</p>
        <Checkbox
          label='This is a press image'
          isChecked={isPress}
          onChange={() => setIsPress(!isPress)}
          attributes={{
            name: `${namePrefix}isPress`,
            'aria-controls': controlledCheckboxId,
            'aria-expanded': isPress
          }}
        />
        <Checkbox
          controlledId={controlledCheckboxId}
          label='Hide this image on the About page'
          isChecked={isHiddenOnAboutPage}
          onChange={() => setIsHiddenOnAboutPage(!isHiddenOnAboutPage)}
          attributes={{
            name: `${namePrefix}isHiddenOnAboutPage`,
            hidden: !isPress
          }}
        />
      </fieldset>
      <Input
        label='Title'
        description='Used for internal search only, never displayed publicly.'
        defaultValue={formImage?.title}
        attributes={{
          maxLength: 255,
          name: `${namePrefix}title`,
          placeholder: 'Title'
        }}
      />
      {id && (
        <Input
          label='Image ID'
          defaultValue={id}
          attributes={{
            name: 'id',
            type: 'hidden'
          }}
        />
      )}
      {createdAt && (
        <Input
          label='Created At'
          defaultValue={createdAt.toISOString()}
          attributes={{
            name: 'createdAt',
            type: 'hidden'
          }}
        />
      )}
    </>
  )
}
