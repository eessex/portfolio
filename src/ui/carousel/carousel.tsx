'use client'

import {
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'
import clsx from 'clsx'
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState
} from 'react'

import styles from '@/ui/carousel/carousel.module.scss'

/** Share of the track's visible width each arrow click scrolls. */
const SCROLL_STEP = 0.8

/**
 * Rendered heights (px) of a carousel's fixed-height media slides,
 * read by the `media-slide` SCSS mixin.
 */
export type CarouselMediaHeights = {
  height: number
  /** below the `narrow` container breakpoint */
  narrowHeight: number
}

/** Request width and `sizes` for media in a fixed-height slide. */
export function mediaSlideSize(
  { height }: CarouselMediaHeights,
  aspect: number
) {
  const width = Math.round(height * aspect)
  return { width, sizes: `${width}px` }
}

/**
 * Full-width horizontal swipe row with a labelled header. Scrolling
 * is native (touch/trackpad); arrows appear only while the track
 * overflows.
 */
export function Carousel({
  id,
  title,
  count,
  actions,
  mediaHeights,
  className,
  trackClassName,
  children
}: {
  id?: string
  title: string
  count?: number
  /** extra header controls, left of the arrows */
  actions?: React.ReactNode
  /** for slides styled with the `media-slide` mixin */
  mediaHeights?: CarouselMediaHeights
  className?: string
  trackClassName?: string
  children: React.ReactNode
}) {
  const titleId = useId()
  const trackRef = useRef<HTMLUListElement>(null)
  const [isOverflowing, setIsOverflowing] = useState(false)

  const measure = useCallback(() => {
    const track = trackRef.current
    if (!track) return
    setIsOverflowing(track.scrollWidth > track.clientWidth + 1)
  }, [])

  // children can change the scroll width without resizing the track
  useEffect(measure)

  useEffect(() => {
    const track = trackRef.current
    if (!track || typeof ResizeObserver === 'undefined') return

    const observer = new ResizeObserver(measure)
    observer.observe(track)
    for (const item of track.children) observer.observe(item)
    return () => observer.disconnect()
  }, [measure, children])

  function scroll(direction: 1 | -1) {
    const track = trackRef.current
    track?.scrollBy({
      left: direction * track.clientWidth * SCROLL_STEP,
      behavior: 'smooth'
    })
  }

  return (
    <section
      id={id}
      className={clsx(styles.carousel, className)}
      style={mediaHeights && mediaHeightVars(mediaHeights)}
      aria-labelledby={titleId}
    >
      <header className={styles.header}>
        <h2 id={titleId}>
          {title}
          {count !== undefined && isOverflowing && (
            <span className={styles.count}>{count}</span>
          )}
        </h2>

        <div className={styles.controls}>
          {actions}
          {isOverflowing && (
            <div className={styles.arrows}>
              <button
                type='button'
                className='button-icon'
                aria-label='Previous'
                onClick={() => scroll(-1)}
              >
                <ChevronLeftIcon aria-hidden='true' />
              </button>
              <button
                type='button'
                className='button-icon'
                aria-label='Next'
                onClick={() => scroll(1)}
              >
                <ChevronRightIcon aria-hidden='true' />
              </button>
            </div>
          )}
        </div>
      </header>

      <ul
        ref={trackRef}
        className={clsx(styles.track, trackClassName)}
      >
        {children}
      </ul>
    </section>
  )
}

function mediaHeightVars({
  height,
  narrowHeight
}: CarouselMediaHeights) {
  return {
    '--carousel-media-height': `${height}px`,
    '--carousel-media-height-narrow': `${narrowHeight}px`
  } as React.CSSProperties
}

/** One snap point in a `Carousel` track. */
export function CarouselItem({
  className,
  children
}: {
  className?: string
  children: React.ReactNode
}) {
  return <li className={clsx(styles.item, className)}>{children}</li>
}
