'use client'

import { XMarkIcon } from '@heroicons/react/24/outline'

import type { EmbedCode } from '@/lib/embed-codes/types'
import { defaultEmbedSizeByHost } from '@/ui/embed-codes/util'

export function EmbedCodeItem({
  embedCode,
  onRemove
}: {
  embedCode: Partial<EmbedCode>
  onRemove?: (id?: string) => void
}) {
  function handleRemove() {
    onRemove?.(embedCode.id)
  }

  if (!embedCode.src) return null

  return (
    <figure style={{ position: 'relative' }}>
      <div style={defaultEmbedSizeByHost(embedCode.host)}>
        <iframe
          src={embedCode.src}
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
      {embedCode.caption && !onRemove && (
        <figcaption>{embedCode.caption}</figcaption>
      )}

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
