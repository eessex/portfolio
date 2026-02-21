'use client'

import { XMarkIcon } from '@heroicons/react/24/outline'
import {
  useEffect,
  useState
} from 'react'

import type { EmbedCode } from '@/lib/embed-codes/types'
import { extractIframeParams } from '@/ui/embed-codes/util'

export function EmbedCodeItem ({
  embedCode,
  onRemove
}: {
  embedCode: Partial<EmbedCode>
  onRemove?: (id?: string) => void
}) {
  const [embedCodeIframe, setEmbedCodeIframe] = useState<ReturnType<typeof extractIframeParams> | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const props = extractIframeParams(embedCode.iframe || '')
    setEmbedCodeIframe(props)
    setMounted(true)
  }, [embedCode?.iframe])

  if (!mounted) return null

  function handleRemove () {
    setEmbedCodeIframe(null)
    onRemove?.(embedCode.id)
  }

  function iframeDimensionProps (): React.CSSProperties {
    return {
      position: 'relative',
      width: embedCodeIframe?.width ? (embedCodeIframe.width === '100%' ? '100%' : `${embedCodeIframe.width}px`) : '100%',
      height: embedCodeIframe?.height && !isNaN(embedCodeIframe?.height) ? `${embedCodeIframe.height}px` : 'auto',
      aspectRatio: embedCodeIframe?.aspectRatio ? `${embedCodeIframe.aspectRatio}` : 'unset'
    }
  }

  return (
    <figure>
      <div style={iframeDimensionProps()}>
        {embedCodeIframe && (
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
        )}
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
