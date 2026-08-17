import { XMarkIcon } from '@heroicons/react/16/solid'
import React, { useEffect, useState } from 'react'

import type { Image } from '@/lib/images/schemas/db'
import styles from '@/ui/form/form.module.scss'
import type { InputProps } from '@/ui/form/input'
import { Input } from '@/ui/form/input'
import { usedOnPages } from '@/ui/util'

export function FileInputImage({
  ariaControls,
  ariaExpanded,
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
  ariaControls?: string
  ariaExpanded?: boolean
  image?: Partial<Image>
  onChange?: (
    fileName: string,
    aspectRatio: number | undefined,
    isDirty: boolean
  ) => void
}) {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [_aspectRatio, setAspectRatio] = useState<number | undefined>(
    image?.aspect || undefined
  )
  const [imageUrl, setImageUrl] = useState<string | undefined>(
    image?.url || undefined
  )
  const [loadError, setLoadError] = useState<string | null>(null)

  const usedOnCount = (image as Image)?.id
    ? usedOnPages(image as Image).length
    : 0

  useEffect(() => {
    if (!file || !previewUrl) {
      return
    }
    const img = new Image()
    img.src = previewUrl
    img.onload = () => {
      const width = img.naturalWidth
      const height = img.naturalHeight
      const ratio = width / height
      setAspectRatio(ratio)
      onChange?.(file.name, ratio, true)
    }
    img.onerror = () => {
      setPreviewUrl(null)
      setFile(null)
      setImageUrl(undefined)
      setAspectRatio(undefined)
      setLoadError(
        `"${file.name}" couldn't be loaded. Choose a different file.`
      )
      onChange?.('', undefined, true)
    }
    return () => {
      img.onload = null
      img.onerror = null
    }
  }, [file, previewUrl, onChange])

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0] ?? null
    setLoadError(null)
    if (!selectedFile) {
      setPreviewUrl(null)
      setAspectRatio(
        imageUrl ? image?.aspect || undefined : undefined
      )
      onChange?.('', undefined, true)
      setFile(null)
      return
    }
    const url = URL.createObjectURL(selectedFile)
    setPreviewUrl(url)
    setFile(selectedFile)
  }

  function onRemovePreviewImage() {
    setPreviewUrl(null)
    setAspectRatio(imageUrl ? image?.aspect || undefined : undefined)
    onChange?.('', undefined, true)
    setFile(null)
  }

  function onRemoveSavedImage() {
    if (usedOnCount > 0) {
      const confirmed = confirm(
        `This image is used on ${usedOnCount} existing page(s). Changing it here will update all pages it is used on. Are you sure you want to remove it?`
      )
      if (!confirmed) return
    }
    // keep changes local to this component in case we want to cancel.
    // server will prefer the new input file and require it once the url is removed
    setImageUrl(undefined)
  }

  return (
    <div className={styles['file-input']}>
      {(previewUrl || imageUrl) && (
        <>
          <figure
            className={styles['image-preview']}
            style={{
              aspectRatio: _aspectRatio
                ? _aspectRatio.toString()
                : 'auto'
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl || imageUrl}
              alt='Uploaded image preview'
            />
            <button
              title='Remove image'
              aria-label='Remove image'
              aria-controls={ariaControls}
              aria-expanded={ariaExpanded}
              type='button'
              onClick={
                previewUrl ? onRemovePreviewImage : onRemoveSavedImage
              }
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
        errors={loadError ? [loadError] : undefined}
        value={value}
        isLabelHidden={isLabelHidden}
        label={label}
        onChange={onFileChange}
      />
    </div>
  )
}
