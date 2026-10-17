'use client'

import {
  ArrowDownTrayIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import NextImage from 'next/image'
import { useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { type Image, ImageTypes } from '@/lib/images/schemas/db'
import { useModalDialog } from '@/ui/dialog/use-modal-dialog'
import styles from '@/ui/images/image-lightbox.module.scss'
import { Spinner } from '@/ui/spinner/spinner'

/** Minimum horizontal touch travel, in px, that counts as a swipe. */
const SWIPE_THRESHOLD = 50

/**
 * Full-screen viewer for `images`, opened at `index`. Navigation
 * wraps; Esc closes and ←/→ step. A modal `<dialog>`, so focus is
 * trapped inside and returned to the opener on close.
 */
export function ImageLightbox({
  images,
  index,
  onIndexChange,
  onClose
}: {
  images: Image[]
  index: number
  onIndexChange: (index: number) => void
  onClose: () => void
}) {
  const titleId = useId()
  const closeRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useModalDialog({
    onClose,
    initialFocusRef: closeRef
  })
  const touchStartXRef = useRef<number | null>(null)
  const [loadedId, setLoadedId] = useState<string>()
  const image = images[index]
  const total = images.length

  function step(direction: 1 | -1) {
    onIndexChange((index + direction + total) % total)
  }

  if (!image) return null

  const isMulti = total > 1
  const isLoading = loadedId !== image.id

  return createPortal(
    <dialog
      ref={dialogRef}
      className={styles.lightbox}
      aria-labelledby={titleId}
      // clicking the image focuses the dialog, so ←/→ still land here
      tabIndex={-1}
      data-backdrop
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') step(1)
        if (e.key === 'ArrowLeft') step(-1)
      }}
      onClick={(e) => {
        if ((e.target as HTMLElement).hasAttribute('data-backdrop')) {
          onClose()
        }
      }}
      onTouchStart={(e) => {
        touchStartXRef.current = e.touches[0].clientX
      }}
      onTouchEnd={(e) => {
        const startX = touchStartXRef.current
        touchStartXRef.current = null
        if (startX === null || !isMulti) return
        const dx = e.changedTouches[0].clientX - startX
        if (Math.abs(dx) >= SWIPE_THRESHOLD) step(dx < 0 ? 1 : -1)
      }}
    >
      <div className={styles.bar} data-backdrop>
        <h2 id={titleId} className={styles.counter}>
          <span className='visually-hidden'>Image </span>
          {index + 1} / {total}
        </h2>
        <button
          ref={closeRef}
          type='button'
          className={styles.close}
          onClick={onClose}
        >
          Close
          <XMarkIcon aria-hidden='true' />
        </button>
      </div>

      <div className={styles.stage} data-backdrop>
        {isMulti ? (
          <button
            type='button'
            className='button-icon'
            aria-label='Previous image'
            onClick={() => step(-1)}
          >
            <ChevronLeftIcon aria-hidden='true' />
          </button>
        ) : (
          <span data-backdrop />
        )}

        <NextImage
          key={image.id}
          src={image.url}
          alt={image.alt || image.caption || ''}
          width={1600}
          height={Math.round(1600 / image.aspect)}
          sizes='100vw'
          style={{ aspectRatio: image.aspect }}
          className={isLoading ? styles.loading : undefined}
          onLoad={() => setLoadedId(image.id)}
          onError={() => setLoadedId(image.id)}
        />

        {isLoading && <Spinner label='Loading image' isCentered />}

        {isMulti ? (
          <button
            type='button'
            className='button-icon'
            aria-label='Next image'
            onClick={() => step(1)}
          >
            <ChevronRightIcon aria-hidden='true' />
          </button>
        ) : (
          <span data-backdrop />
        )}
      </div>

      <div className={styles.bar} data-backdrop>
        <span className={styles.caption}>{image.caption}</span>
        {isPressImage(image) && <DownloadImageLink image={image} />}
      </div>
    </dialog>,
    document.body
  )
}

/** Only press images are offered for download. */
export function isPressImage(image: Image) {
  return image.type === ImageTypes.press
}

/** Links straight to the original upload. */
export function DownloadImageLink({ image }: { image: Image }) {
  return (
    <a
      href={image.url}
      download
      target='_blank'
      rel='noopener noreferrer'
      className='button'
    >
      Download high-res
      <ArrowDownTrayIcon aria-hidden='true' />
    </a>
  )
}
