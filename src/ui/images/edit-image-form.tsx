import { XMarkIcon } from '@heroicons/react/24/outline'
import NextImage from 'next/image'
import {
  useId,
  useState
} from 'react'

import type { Image } from '@/lib/images/types'
import { Checkbox } from '@/ui/form/checkbox'
import { Input } from '@/ui/form/input'

interface ImageProps {
  image?: Image
}

export const EditImage = ({ image }: ImageProps) => {
  const [isPress, setIsPress] = useState(!!image?.isPress)
  const [isHiddenOnAboutPage, setIsHiddenOnAboutPage] = useState(!!image?.isHiddenOnAboutPage)
  const controlledCheckboxId = useId()

  return (
    <>
      <div>
        <Input
          label='Image url'
          description='Paste the url href from your cloud storage or AWS S3 bucket'
          defaultValue={image?.url}
          attributes={{
            autoFocus: !image?.url && !image?.id,
            maxLength: 1500,
            name: 'url',
            placeholder: 'https://your-cloud-storage.com/images/unique-filename.jpg',
            required: true,
            type: (image?.id && image?.url) ? 'hidden' : undefined
          }}
        />
        {image?.url && (
          <figure style={{
            aspectRatio: image.aspect, marginInline: 'auto'
          }}
          >
            <NextImage
              src={image.url}
              alt=''
              width={680}
              height={680 / image.aspect}
              priority
              fetchPriority='high'
            />
            <button
              title='Remove image'
              aria-label='Remove image'
              type='button'
              className='button icon-button'
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
          name: 'caption',
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
            name: 'isPress',
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
            name: 'isHiddenOnAboutPage',
            hidden: !isPress
          }}
        />
      </fieldset>
      <Input
        label='Title'
        description='Used for internal search only, never displayed publicly'
        defaultValue={image?.title}
        attributes={{
          maxLength: 255,
          name: 'title',
          placeholder: 'Title'
        }}
      />
      {image?.id && (
        <Input
          label='Image ID'
          defaultValue={image.id}
          attributes={{
            name: 'id',
            type: 'hidden'
          }}
        />
      )}
      {image?.createdAt && (
        <Input
          label='Created At'
          defaultValue={image.createdAt.toISOString()}
          attributes={{
            name: 'createdAt',
            type: 'hidden'
          }}
        />
      )}
      {image?.aspect && (
        <Input
          label='Aspect Ratio'
          defaultValue={image.aspect}
          attributes={{
            name: 'aspect',
            type: 'hidden'
          }}
        />
      )}
    </>
  )
}
