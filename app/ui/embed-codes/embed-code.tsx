'use client'
import { EmbedCode } from '@/lib/definitions'
import { useCallback } from 'react'

export function EmbedCodeItem ({
  embedCode,
  isLazy = true
}: {
  embedCode: EmbedCode
  isLazy?: boolean
}) {
  const containerRef = useCallback((node: HTMLElement | null) => {
    if (node !== null) {
      node.firstElementChild?.setAttribute('loading', isLazy ? 'lazy' : 'eager')
    }
  }, [isLazy])

  return (
    <figure>
      <div dangerouslySetInnerHTML={{ __html: embedCode.iframe }} ref={containerRef} />
      {embedCode.caption && <figcaption>{embedCode.caption}</figcaption>}
    </figure>
  )
}
