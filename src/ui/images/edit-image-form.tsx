import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useCallback, useRef, useState } from 'react'

import type { Image } from '@/lib/images/types'
import { Checkbox } from '@/ui/form/checkbox'
import { Input, type InputType } from '@/ui/form/input'

interface ImageProps {
  image?: Image
  index?: number
  isFielset?: boolean
  ref?: (el: InputType) => InputType | null
  onRemoveImage?: (index: number) => void
}

export const EditImageFieldset = ({ image, index, ref, onRemoveImage }: ImageProps) => {
  return (
    <fieldset key={index}>
      <legend className='visually-hidden'>
        {`Image: ${image?.caption || image?.title || index || 0 + 1}`}
      </legend>

      <EditImage
        image={image}
        index={index}
        ref={ref}
        onRemoveImage={onRemoveImage}
      />

      {image && !image.url && onRemoveImage && index && (
        <button
          title='Remove image'
          aria-label='Remove image'
          type='button'
          onClick={(() => onRemoveImage(index))}
          className='button'
        >
          <XMarkIcon />
        </button>
      )}
    </fieldset>
  )
}

export const EditImage = ({ image, index, ref, onRemoveImage }: ImageProps) => {
  const [isPress, setIsPress] = useState(!!image?.isPress)
  const [isHiddenOnAboutPage, setIsHiddenOnAboutPage] = useState(!!image?.isHiddenOnAboutPage)
  const hasIndex = typeof index === 'number' && index >= 0

  return (
    <>
      <div>
        <Input
          label='Image url'
          description='Paste the url href from your cloud storage or AWS S3 bucket'
          defaultValue={image?.url}
          isTextarea={!image?.id}
          ref={ref}
          attributes={{
            autoFocus: !image?.url && !image?.id,
            maxLength: 1500,
            name: hasIndex ? `image[${index}].url` : 'url',
            placeholder: '<iframe></iframe>',
            required: true,
            type: image?.id && hasIndex ? 'hidden' : undefined
          }}
        />
        {image?.url.length && onRemoveImage && index && (
          <figure>
            <div dangerouslySetInnerHTML={{ __html: image.url }} />
            <button
              title='Remove image'
              aria-label='Remove embed'
              type='button'
              onClick={(() => onRemoveImage(index))}
              className='button'
            >
              <XMarkIcon />
            </button>
          </figure>
        )}
      </div>
      <Input
        label='Caption'
        description='Displayed below the iframe wherever it appears'
        defaultValue={image?.caption}
        attributes={{
          maxLength: 255,
          name: hasIndex ? `image[${index}].caption` : 'caption',
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
            name: hasIndex ? `image[${index}].isPress` : 'isPress'
          }}
        />
        <Checkbox
          label='Hide this image on the About page'
          isChecked={isHiddenOnAboutPage}
          onChange={() => setIsHiddenOnAboutPage(!isHiddenOnAboutPage)}
          attributes={{
            name: hasIndex ? `image[${index}].isHiddenOnAboutPage` : 'isHiddenOnAboutPage'
          }}
        />
      </fieldset>
      <Input
        label='Title'
        description='Used for internal search only, never displayed publicly'
        defaultValue={image?.title}
        attributes={{
          maxLength: 255,
          name: hasIndex ? `image[${index}].title` : 'title',
          placeholder: 'Title'
        }}
      />
      {image?.id && (
        <Input
          label='Image ID'
          defaultValue={image.id}
          attributes={{
            name: hasIndex ? `image[${index}].id` : 'id',
            type: 'hidden'
          }}
        />
      )}
      {image?.createdAt && (
        <Input
          label='Created At'
          defaultValue={image.createdAt.toISOString()}
          attributes={{
            name: hasIndex ? `image[${index}].createdAt` : 'createdAt',
            type: 'hidden'
          }}
        />
      )}
      {image?.aspect && (
        <Input
          label='Aspect Ratio'
          defaultValue={image.aspect}
          attributes={{
            name: hasIndex ? `image[${index}].aspect` : 'aspect',
            type: 'hidden'
          }}
        />
      )}
    </>
  )
}

export const EditImagesFieldset = ({
  images
}: {
  images: Image[]
}) => {
  const initialImages = images || []
  const [imageList, setImageList] = useState(initialImages)
  const inputRefs = useRef<InputType[]>([])

  const addToRefs = useCallback((el: InputType | null) => {
    if (!el || inputRefs.current.includes(el)) return null
    inputRefs.current.push(el)
    return el
  }, [])

  function handleAddImage () {
    const newImage = { url: '', caption: '', id: '', aspect: 1, tagIds: [], createdAt: new Date() }
    if (!imageList.some(image => (!image.url && !image.caption && !image.id))) {
      setImageList([...imageList, newImage])
    } else {
      const lastIndex = imageList.length - 1
      inputRefs.current[lastIndex]?.focus()
    }
  }

  function handleRemoveImage (index: number) {
    const updatedImages = [...imageList]
    updatedImages.splice(index, 1)
    setImageList(updatedImages)
  }

  return (
    <fieldset>
      <legend>Images</legend>
      {imageList?.map((image, index) => (
        <EditImage
          key={index}
          image={image}
          index={index}
          ref={addToRefs}
          onRemoveImage={handleRemoveImage}
        />
      ))}

      <button
        type='button'
        className='button button-secondary text-sm'
        onClick={handleAddImage}
      >
        <PlusIcon />Add new image
      </button>
    </fieldset>
  )
}
