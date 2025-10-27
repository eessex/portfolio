import { XMarkIcon } from '@heroicons/react/16/solid'
import React, {
  useEffect,
  useState
} from 'react'

import type {
  CreateImage, Image
} from '@/lib/images/types'
import styles from '@/ui/form/form.module.scss'
import type { InputProps } from '@/ui/form/input'
import { Input } from '@/ui/form/input'

export function FileInput ({
  label,
  className,
  description,
  defaultValue,
  value,
  attributes,
  isLabelHidden,
  onChange,
  ref,
  image,
  onRemoveImage
}: Omit<InputProps<HTMLInputElement>, 'children' | 'onChange'> & {
  image?: Image | CreateImage
  onChange?: (fileName: string, aspectRatio: number | undefined, isDirty: boolean) => void
  onRemoveImage?: () => void
}) {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [_aspectRatio, setAspectRatio] = useState<number | undefined>(image?.aspect || undefined)

  useEffect(() => {
    if (!file) {
      console.info('useEffect No file selected')
      setPreviewUrl(null)
      setAspectRatio(undefined)
      onChange?.('', undefined, true)
      return
    }
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)

    const img = new Image()
    img.src = url
    console.info('useEffect Image loaded')
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
    console.info('onFileChange')
    const selectedFile = e.target.files?.[0] ?? null
    setFile(selectedFile)
  }

  return (
    <div className={styles['file-input']}>
      {(previewUrl || image?.url) &&
        (
          <>
            <div
              className={styles['image-preview']}
              style={{ aspectRatio: _aspectRatio ? _aspectRatio.toString() : 'auto' }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl || image?.url}
                alt='Uploaded image preview'
              />
              <button
                title='Remove image'
                aria-label='Remove image'
                type='button'
                onClick={previewUrl ? () => setFile(null) : onRemoveImage}
                className='button icon-button'
              >
                <XMarkIcon />
              </button>
            </div>
          </>
        )}
      {!image?.url && (
        <Input
          ref={ref}
          attributes={{
            ...attributes,
            name: attributes?.name || 'file',
            type: 'file'
          }}
          className={className}
          description={description}
          defaultValue={defaultValue}
          value={value}
          isLabelHidden={isLabelHidden}
          label={label}
          onChange={onFileChange}
        />
      )}
    </div>
  )
}
