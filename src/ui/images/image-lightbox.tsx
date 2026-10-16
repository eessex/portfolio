'use client'

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import NextImage from 'next/image'
import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { type Image, ImageTypes } from '@/lib/images/schemas/db'
import styles from '@/ui/images/image-lightbox.module.scss'

/** Minimum horizontal touch travel, in px, that counts as a swipe. */
const SWIPE_THRESHOLD = 50

/**
 * Full-screen viewer for `images`, opened at `index`. Navigation
 * wraps; Esc closes and ←/→ step. Focus is trapped inside and
 * returned to the opener on close.
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
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const touchStartXRef = useRef<number | null>(null)
  const [loadedId, setLoadedId] = useState<string>()
  const image = images[index]
  const total = images.length

  function step(direction: 1 | -1) {
    onIndexChange((index + direction + total) % total)
  }

  // latest handlers for the document listener, without resubscribing
  const stepRef = useRef(step)
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    stepRef.current = step
    onCloseRef.current = onClose
  })

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()

    function handleKeyDown(event: KeyboardEvent) {
      switch (event.key) {
        case 'Escape':
          onCloseRef.current()
          break
        case 'ArrowRight':
          stepRef.current(1)
          break
        case 'ArrowLeft':
          stepRef.current(-1)
          break
        case 'Tab':
          trapFocus(event, dialogRef.current)
          break
      }
    }
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = overflow
      opener?.focus()
    }
  }, [])

  if (!image) return null

  const isMulti = total > 1
  const isLoading = loadedId !== image.id

  return createPortal(
    <div
      ref={dialogRef}
      className={styles.lightbox}
      role='dialog'
      aria-modal='true'
      aria-labelledby={titleId}
      data-backdrop
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
        />

        {isLoading && (
          <span className={styles.spinner} role='status'>
            <span className='visually-hidden'>Loading image</span>
          </span>
        )}

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
        <span>{image.caption}</span>
        {isPressImage(image) && <DownloadImageLink image={image} />}
      </div>
    </div>,
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
      className={styles.download}
    >
      Download high-res ↓
    </a>
  )
}

function trapFocus(
  event: KeyboardEvent,
  container: HTMLElement | null
) {
  if (!container) return
  const focusable =
    container.querySelectorAll<HTMLElement>('button, [href]')
  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  if (!first) return

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  } else if (!container.contains(document.activeElement)) {
    event.preventDefault()
    first.focus()
  }
}
