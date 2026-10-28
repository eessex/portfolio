import { XMarkIcon } from '@heroicons/react/16/solid'
import clsx from 'clsx'
import React, { useEffect, useRef, useState } from 'react'

import type { Image } from '@/lib/images/schemas/db'
import {
  ACCEPTED_IMAGE_TYPES,
  formatMegabytes,
  imageAspect,
  MAX_UPLOAD_FILE_SIZE,
  MIN_SHORT_EDGE,
  tooSmallMessage
} from '@/lib/images/util'
import styles from '@/ui/form/form.module.scss'
import type { InputProps } from '@/ui/form/input'
import { Input } from '@/ui/form/input'

export function FileInputImage({
  ariaControls,
  ariaExpanded,
  label,
  className,
  description,
  defaultValue,
  validationText,
  value,
  attributes,
  isLabelHidden,
  onChange,
  ref,
  image,
  isReplaceable = true
}: Omit<InputProps<HTMLInputElement>, 'children' | 'onChange'> & {
  ariaControls?: string
  ariaExpanded?: boolean
  image?: Partial<Image>
  /**
   * False for a saved image: its file never changes, so only the
   * preview shows. To change the picture, add a new image.
   */
  isReplaceable?: boolean
  onChange?: (
    fileName: string,
    aspectRatio: number | undefined,
    isDirty: boolean
  ) => void
}) {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const savedAspect = image?.url ? imageAspect(image) : undefined
  const [_aspectRatio, setAspectRatio] = useState<number | undefined>(
    savedAspect
  )
  const [imageUrl, setImageUrl] = useState<string | undefined>(
    image?.url || undefined
  )
  const [loadError, setLoadError] = useState<string | null>(null)
  // A file input's value can only be cleared via the live DOM node
  // (React can't set it), so keep a ref to reset it when the preview is
  // cleared, otherwise the input keeps showing the old filename.
  const inputRef = useRef<HTMLInputElement | null>(null)

  function setInputRef(el: HTMLInputElement | null) {
    inputRef.current = el
    ref?.(el)
  }

  function clearFileInput() {
    if (inputRef.current) inputRef.current.value = ''
  }

  useEffect(() => {
    if (!file || !previewUrl) {
      return
    }
    function rejectFile(message: string) {
      setPreviewUrl(null)
      setFile(null)
      setImageUrl(undefined)
      setAspectRatio(undefined)
      setLoadError(message)
      onChange?.('', undefined, true)
      clearFileInput()
    }
    const img = new Image()
    img.src = previewUrl
    img.onload = () => {
      const width = img.naturalWidth
      const height = img.naturalHeight
      if (Math.min(width, height) < MIN_SHORT_EDGE) {
        rejectFile(`${tooSmallMessage(file.name)}.`)
        return
      }
      const ratio = width / height
      setAspectRatio(ratio)
      onChange?.(file.name, ratio, true)
    }
    img.onerror = () => {
      rejectFile(
        `"${file.name}" couldn't be loaded as an image. Choose a different file.`
      )
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
      setAspectRatio(imageUrl ? savedAspect : undefined)
      onChange?.('', undefined, true)
      setFile(null)
      return
    }
    // `accept` only filters the picker; drag-and-drop and "All files" bypass it
    const fileError = !ACCEPTED_IMAGE_TYPES.includes(
      selectedFile.type
    )
      ? `"${selectedFile.name}" isn't a supported image. Choose a JPEG, PNG, WebP or GIF.`
      : selectedFile.size > MAX_UPLOAD_FILE_SIZE
        ? `"${selectedFile.name}" is too large. Choose a file under ${formatMegabytes(MAX_UPLOAD_FILE_SIZE)}.`
        : null
    if (fileError) {
      setPreviewUrl(null)
      setAspectRatio(imageUrl ? savedAspect : undefined)
      setFile(null)
      setLoadError(fileError)
      onChange?.('', undefined, true)
      // clear the input so re-selecting the same file re-fires change
      e.target.value = ''
      return
    }
    const url = URL.createObjectURL(selectedFile)
    setPreviewUrl(url)
    setFile(selectedFile)
  }

  function onRemovePreviewImage() {
    setPreviewUrl(null)
    setAspectRatio(imageUrl ? savedAspect : undefined)
    onChange?.('', undefined, true)
    setFile(null)
    clearFileInput()
  }

  function onReplaceImage() {
    inputRef.current?.click()
  }

  function onRemoveSavedImage() {
    // keep changes local to this component in case we want to cancel.
    // server will prefer the new input file and require it once the url is removed
    setImageUrl(undefined)
  }

  if (!isReplaceable && imageUrl) {
    return (
      <div className={clsx(styles['file-input'])}>
        <figure
          className={clsx(styles['image-preview'], 'item-preview')}
          style={{
            aspectRatio: _aspectRatio
              ? _aspectRatio.toString()
              : 'auto'
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt='Saved image preview' />
        </figure>
      </div>
    )
  }

  return (
    <div className={clsx(styles['file-input'])}>
      {(previewUrl || imageUrl) && (
        <>
          <figure
            className={clsx(styles['image-preview'], 'item-preview')}
            style={{
              aspectRatio: _aspectRatio
                ? _aspectRatio.toString()
                : 'auto'
            }}
          >
            {/* Clicking the preview reopens the picker to swap the file. */}
            <button
              type='button'
              title='Replace image'
              aria-label='Replace image'
              onClick={onReplaceImage}
              className={styles['replace-image']}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl || imageUrl}
                alt='Uploaded image preview'
              />
            </button>
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
        ref={setInputRef}
        attributes={{
          ...attributes,
          name: attributes?.name || 'file',
          type: 'file',
          accept: ACCEPTED_IMAGE_TYPES.join(','),
          hidden: !!(previewUrl || imageUrl),
          // Required only until an image is chosen unless the caller overrides
          required:
            attributes?.required !== false && !previewUrl && !imageUrl
        }}
        className={className}
        description={description}
        defaultValue={defaultValue}
        errors={loadError ? [loadError] : undefined}
        validationText={validationText}
        value={value}
        isLabelHidden={isLabelHidden}
        label={label}
        onChange={onFileChange}
      />
    </div>
  )
}
