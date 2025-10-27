import { useState } from 'react'

import { checkIfImageExists } from '@/lib/images/actions'
import type {
  CreateImage,
  Image
} from '@/lib/images/types'
import { Checkbox } from '@/ui/form/checkbox'
import { FileInput } from '@/ui/form/file-input-image'
import {
  Input,
  type InputProps,
  type InputType
} from '@/ui/form/input'

import { usedOnPages } from '../util'

interface ImageProps {
  image?: Image
  index?: number
  ref?: InputProps<InputType>['ref']
}

export const EditImage = ({
  image,
  index,
  ref
}: ImageProps) => {
  const [formImage, setFormImage] = useState<CreateImage | Image | undefined>(image)
  const [isPress, setIsPress] = useState(!!image?.isPress)
  const [aspectRatio, setAspectRatio] = useState<number | undefined>(image?.aspect || undefined)
  const [isHiddenOnAboutPage, setIsHiddenOnAboutPage] = useState(!!image?.isHiddenOnAboutPage)

  const hasIndex = typeof index === 'number' && index >= 0
  const {
    createdAt,
    id,
    url
  } = (formImage || {}) as Image
  const usedOn = image?.id ? usedOnPages(image as Image).length : 0

  function onRemove () {
    console.info('onRemove')
    if (usedOn > 0) {
      const onConfirm = confirm(`
        This image is used on ${usedOn === 1 ? '1 page' : usedOn + ' pages'},
        replacing it here will also change this image everywhere it is used.
      `)
      if (!onConfirm) return
    }
    setFormImage({
      ...formImage, url: ''
    } as CreateImage)
    setAspectRatio(undefined)
  }

  function formattedName (field: string) {
    return hasIndex ? `image[${index}].${field}` : field
  }

  async function onFileChange (filename: string, aspectRatio: number | undefined) {
    console.info('onFileChange')
    setAspectRatio(aspectRatio)
    if (filename) {
      try {
        const existingImage = await checkIfImageExists(filename)
        if (existingImage) {
          if (id) {
            alert('An image with this URL already exists, use a unique filename.')
          } else {
            const confirmed = confirm('An image with this URL already exists, "confirm" to use existing, or "cancel" and upload with a unique filename.')
            if (confirmed) {
              setFormImage(existingImage)
            }
          }
        }
      } catch (error) {
        console.error('Error checking if image exists:', error)
      }
    }
  }

  return (
    <>
      <FileInput
        label='Upload new image'
        attributes={{
          accept: 'image/*',
          name: formattedName('file'),
          required: true
        }}
        image={formImage}
        onChange={onFileChange}
        onRemoveImage={onRemove}
      />
      {aspectRatio && (
        <Input
          label='Aspect Ratio'
          value={aspectRatio}
          attributes={{
            name: formattedName('aspect'),
            type: 'hidden'
          }}
        />
      )}
      {/* keep a record of existing image files so we can delete them from s3 */}
      {url?.length > 0 && id && (
        <Input
          label='Image url'
          description='Paste the url href AWS S3 bucket.'
          defaultValue={url}
          ref={ref}
          attributes={{
            maxLength: 250,
            name: formattedName('url'),
            placeholder: 'https://aws.s3.bucket/your-image.jpg',
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
          name: formattedName('caption'),
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
          attributes={{ name: formattedName('isPress') }}
        />
        <Checkbox
          label='Hide this image on the About page'
          isChecked={isHiddenOnAboutPage}
          onChange={() => setIsHiddenOnAboutPage(!isHiddenOnAboutPage)}
          attributes={{
            name: formattedName('isHiddenOnAboutPage'),
            disabled: !isPress,
            type: !isPress ? 'hidden' : undefined
          }}
        />
      </fieldset>
      <Input
        label='Title'
        description='Used for internal search only, never displayed publicly.'
        defaultValue={formImage?.title}
        attributes={{
          maxLength: 255,
          name: formattedName('title'),
          placeholder: 'Title'
        }}
      />
      {id && (
        <Input
          label='Image ID'
          defaultValue={id}
          attributes={{
            name: formattedName('id'),
            type: 'hidden'
          }}
        />
      )}
      {createdAt && (
        <Input
          label='Created At'
          defaultValue={createdAt.toISOString()}
          attributes={{
            name: formattedName('createdAt'),
            type: 'hidden'
          }}
        />
      )}
    </>
  )
}
