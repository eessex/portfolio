'use client'

import { XMarkIcon } from '@heroicons/react/24/outline'
import {
  useEffect,
  useState
} from 'react'

import type { EmbedCodeHost } from '@/lib/embed-codes/schemas'
import type { EmbedCode } from '@/lib/embed-codes/types'
import {
  defaultEmbedSizeByHost,
  extractIframeParams
} from '@/ui/embed-codes/util'

export function EmbedCodeItem ({
  embedCode,
  onRemove
}: {
  embedCode: Partial<EmbedCode>
  onRemove?: (id?: string) => void
}) {
  const [embedCodeIframe, setEmbedCodeIframe] = useState<ReturnType<typeof extractIframeParams> | null>(extractIframeParams(embedCode))

  useEffect(() => {
    const props = extractIframeParams(embedCode)
    setEmbedCodeIframe(props)
  }, [embedCode])

  function handleRemove () {
    setEmbedCodeIframe(null)
    onRemove?.(embedCode.id)
  }

  if (!embedCodeIframe) return null

  return (
    <figure style={{ position: 'relative' }}>
      <div style={embedCodeIframe?.host ? defaultEmbedSizeByHost(embedCodeIframe.host as EmbedCodeHost) : undefined}>
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
