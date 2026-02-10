import { XMarkIcon } from '@heroicons/react/16/solid'
import React, {
  useEffect,
  useState
} from 'react'

import type { Image } from '@/lib/images/types'
import styles from '@/ui/form/form.module.scss'
import type { InputProps } from '@/ui/form/input'
import { Input } from '@/ui/form/input'
import { usedOnPages } from '@/ui/util'

export function FileInputImage ({
  label,
  className,
  description,
  defaultValue,
  value,
  attributes,
  isLabelHidden,
  onChange,
  ref,
  image
}: Omit<InputProps<HTMLInputElement>, 'children' | 'onChange'> & {
  image?: Partial<Image>
  onChange?: (fileName: string, aspectRatio: number | undefined, isDirty: boolean) => void
}) {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [_aspectRatio, setAspectRatio] = useState<number | undefined>(image?.aspect || undefined)
  const [imageUrl, setImageUrl] = useState<string | undefined>(image?.url || undefined)

  const usedOnCount = (image as Image)?.id ? usedOnPages(image as Image).length : 0

  useEffect(() => {
    // todo: move everything that doesn't need cleanup outside of the return function
    if (!file) {
      setPreviewUrl(null)
      setAspectRatio(undefined)
      onChange?.('', undefined, true)
      return
    }
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)

    const img = new Image()
    img.src = url
    img.onload = () => {
      const width = img.naturalWidth
      const height = img.naturalHeight
      const ratio = width / height
      setAspectRatio(ratio)
      onChange?.(file.name, ratio, true)
    }
    return () => URL.revokeObjectURL(url)
  }, [file, onChange])

  function onFileChange (e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0] ?? null
    setFile(selectedFile)
  }

  function onRemoveSavedImage () {
    if (usedOnCount > 0) {
      const confirmed = confirm(`This image is used on ${usedOnCount} existing page(s). Changing it here will update all pages it is used on. Are you sure you want to remove it?`)
      if (!confirmed) return
    }
    // keep changes local to this component in case we want to cancel.
    // server will prefer the new input file and require it once the url is removed
    setImageUrl(undefined)
  }

  return (
    <div className={styles['file-input']}>
      {(previewUrl || imageUrl) &&
        (
          <>
            <figure
              className={styles['image-preview']}
              style={{ aspectRatio: _aspectRatio ? _aspectRatio.toString() : 'auto' }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl || imageUrl}
                alt='Uploaded image preview'
              />
              <button
                title='Remove image'
                aria-label='Remove image'
                type='button'
                onClick={previewUrl ? () => setFile(null) : onRemoveSavedImage}
                className='button-icon button-primary'
              >
                <XMarkIcon />
              </button>
            </figure>
          </>
        )}
      <Input
        ref={ref}
        attributes={{
          ...attributes,
          name: attributes?.name || 'file',
          type: 'file',
          hidden: !!(previewUrl || imageUrl),
          required: !previewUrl && !imageUrl
        }}
        className={className}
        description={description}
        defaultValue={defaultValue}
        value={value}
        isLabelHidden={isLabelHidden}
        label={label}
        onChange={onFileChange}
      />
    </div>
  )
}
