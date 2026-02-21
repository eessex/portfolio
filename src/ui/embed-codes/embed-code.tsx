'use client'

import { XMarkIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'

import type { EmbedCodeType } from '@/lib/embed-codes/schemas'
import type { EmbedCode } from '@/lib/embed-codes/types'
import { urlHostName } from '@/ui/util'

interface IFrameProps {
  src: string
  width: number
  height: number
  prettySrc?: string
  hostname: string
  type?: EmbedCodeType
  title?: string
}

export const AudioEmbedCodeHosts = [
  'bandcamp',
  // 'mixcloud',
  // 'soundcloud',
  'spotify'
] as const

export const VideoEmbedCodeHosts = [
  'vimeo',
  'youtube'
] as const

function extractHostnameType (hostname: string) {
  const audioType = AudioEmbedCodeHosts.find(host => hostname.includes(host))
  if (audioType) return 'audio'

  const videoType = VideoEmbedCodeHosts.find(host => hostname.includes(host))
  if (videoType) return 'video'
}

export function extractIframeData (input: string, isThrowOnError?: boolean): IFrameProps | null {
  if (!input) return null

  const parser = new DOMParser()
  const doc = parser.parseFromString(input, 'text/html')
  const iframe = doc.querySelector('iframe')
  if (!iframe) return null

  const src = iframe.getAttribute('src')
  if (!src || !isSafeIframeUrl(src)) {
    if (isThrowOnError) {
      throw new Error('Invalid iframe code.')
    }
    return null
  }

  let width = Number(iframe.getAttribute('width'))
  let height = Number(iframe.getAttribute('height'))
  const title = iframe.getAttribute('title') || undefined

  // use parent padding-top (Vimeo / responsive embeds)
  if ((!width || !height) && iframe.parentElement?.style?.paddingTop) {
    const match = iframe.parentElement.style.paddingTop.match(/([\d.]+)%/)
    if (match) {
      const percent = parseFloat(match[1])
      if (!isNaN(percent)) {
        width = 100
        height = (percent / 100) * width
      }
    }
  }

  // use iframe style
  if ((!width || !height) && iframe.style) {
    const style = iframe.style
    if (!width) {
      const w = parseInt(style.width)
      if (!isNaN(w)) width = w
    }
    if (!height) {
      const h = parseInt(style.height)
      if (!isNaN(h)) height = h
    }
  }

  if (!width || !height) {
    // fallback to 16/9
    width = 560
    height = 315
  }

  const hostname = urlHostName(src)
  const type = extractHostnameType(hostname)

  return {
    src,
    width,
    height,
    hostname,
    type,
    title
  }
}

function isSafeIframeUrl (url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:'
  } catch {
    return false
  }
}

export function EmbedCodeItem ({
  embedCode,
  onRemove
}: {
  embedCode: EmbedCode
  onRemove?: (id?: string) => void
}) {
  const [embedCodeIframe, setEmbedCodeIframe] = useState(extractIframeData(embedCode?.iframe || ''))

  if (!embedCodeIframe) return null

  function handleRemove () {
    setEmbedCodeIframe(null)
    onRemove?.(embedCode.id)
  }

  return (
    <figure>
      <div
        style={{
          width: '100%',
          position: 'relative',
          aspectRatio: `${embedCodeIframe.width} / ${embedCodeIframe.height}`
        }}
      >
        <iframe
          src={embedCodeIframe.src}
          loading='lazy'
          title='Embedded media preview'
          sandbox='allow-scripts allow-same-origin allow-presentation allow-popups'
          allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
          allowFullScreen
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            border: 0
          }}
        />
      </div>
      {embedCode.caption && !onRemove && <figcaption>{embedCode.caption}</figcaption>}

      {onRemove && (
        <button
          title='Remove embed code'
          aria-label='Remove embed'
          type='button'
          onClick={handleRemove}
          className='button-icon button-primary'
        >
          <XMarkIcon />
        </button>
      )}
    </figure>
  )
}
