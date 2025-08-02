'use client'
import { type EmbedCode } from '@/lib/definitions'
import { useCallback, useState } from 'react'
import AccordionDropdown from '../accordion-dropdown/accordion-dropdown'
import { EmbedCodeItem } from './embed-code'
import Link from 'next/link'

export function EmbedCodeDashboard ({ embedCodes }: { embedCodes: EmbedCode[] }) {
  return (
    <div>
      <ul>
        {embedCodes.map((code) => (
          <EmbedCodeListItem key={code.id} embedCode={code} />
        ))}
      </ul>
    </div>
  )
}

function EmbedCodeListItem ({ embedCode }: { embedCode: EmbedCode }) {
  const [_src, setSrc] = useState<string | null>(null)
  const [iframeHost, setIframeHost] = useState<string | null>(null)
  const containerRef = useCallback((node: HTMLElement | null) => {
    if (node !== null) {
      const parser = new DOMParser()
      const doc = parser.parseFromString(embedCode.iframe, 'text/html')
      const iframeSrc = doc.querySelector('iframe')?.getAttribute('src')
      const iframeHost = new URL(iframeSrc || '', window.location.origin).host
      iframeSrc && setSrc(iframeSrc)
      setIframeHost(iframeHost)
    }
  }, [embedCode.iframe])

  function usedOnPages () {
    const events = embedCode.eventSlugs?.map((slug) => `/event/${slug}`) || []
    const releases = embedCode.releaseSlugs?.map((slug) => `/release/${slug}`) || []
    return [...events, ...releases]
  }
  return (
    <li key={embedCode.id} ref={containerRef}>
      <AccordionDropdown title={embedCode.title || 'Embed Code from ' + iframeHost}>
        <span>{embedCode.title}</span>
        <span>{embedCode.caption}</span>
        <span>{iframeHost || ''}</span>
        <EmbedCodeItem embedCode={embedCode} />
        <h4>Visible on</h4>
        <ul>
          {usedOnPages().length > 0 &&
            usedOnPages().map((page) => (
              <li key={page}>
                <Link href={page} target='_blank' rel='noopener noreferrer'>
                  {page}
                </Link>
              </li>
            ))}
        </ul>
      </AccordionDropdown>
    </li>
  )
}
