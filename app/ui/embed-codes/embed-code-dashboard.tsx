'use client'
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { type EmbedCode } from '@/lib/definitions'
import { useCallback, useState } from 'react'
import AccordionDropdown from '../accordion-dropdown/accordion-dropdown'
import { EmbedCodeItem } from './embed-code'
import Link from 'next/link'
import styles from './embed-codes.module.scss'

export function EmbedCodeDashboard ({ embedCodes }: { embedCodes: EmbedCode[] }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const toggleExpand = () => setIsExpanded(!isExpanded)

  return (
    <div>
      <header className={styles['embed-code-header']}>
        <h2>All embed Codes</h2>
        <button onClick={toggleExpand}>{isExpanded ? 'Collapse all' : 'Expand all'}</button>
      </header>

      <ul>
        {embedCodes.map((code) => (
          <EmbedCodeListItem key={code.id} embedCode={code} isExpanded={isExpanded} />
        ))}
      </ul>
    </div>
  )
}

function EmbedCodeListItem ({ embedCode, isExpanded }: { embedCode: EmbedCode, isExpanded: boolean }) {
  const [_src, setSrc] = useState<string | null>(null)
  const [iframeHost, setIframeHost] = useState<string | null>(null)
  const containerRef = useCallback((node: HTMLElement | null) => {
    if (node !== null && !embedCode.title) {
      const parser = new DOMParser()
      const doc = parser.parseFromString(embedCode.iframe, 'text/html')
      const iframeSrc = doc.querySelector('iframe')?.getAttribute('src')
      const iframeHost = new URL(iframeSrc || '', window.location.origin).host
      iframeSrc && setSrc(iframeSrc)
      setIframeHost(iframeHost)
    }
  }, [embedCode.iframe, embedCode.title])

  function usedOnPages () {
    const events = embedCode.eventSlugs?.map((slug) => `/event/${slug}`) || []
    const releases = embedCode.releaseSlugs?.map((slug) => `/release/${slug}`) || []
    return [...events, ...releases]
  }

  return (
    <li key={embedCode.id} className={styles['embed-code-list-item']} ref={containerRef}>
      <AccordionDropdown title={embedCode.title || 'Embed Code from ' + iframeHost} isExpanded={isExpanded}>
        <EditItemNav onEdit={() => {}} onDelete={() => {}} />
        <EmbedCodeItem embedCode={embedCode} />

        <div>
          <h2>Visible on</h2>
          <ul>
            {usedOnPages().length > 0
              ? (
                  usedOnPages().map((page) => (
                    <li key={page}>
                      <Link href={page} target='_blank' rel='noopener noreferrer'>
                        {page}
                      </Link>
                    </li>
                  ))
                )
              : (
                <li>No pages found</li>
                )}
          </ul>
        </div>
      </AccordionDropdown>
    </li>
  )
}

export function EditItemNav ({ onEdit, onDelete }: { onEdit: () => void, onDelete: () => void }) {
  return (
    <ul className={styles['edit-button']}>
      <li>
        <button className='button sm' onClick={onEdit}>
          <PencilIcon /> Edit
        </button>
      </li>
      <li>
        <button className='button button-secondary sm' onClick={onDelete}>
          <TrashIcon /> Delete
        </button>
      </li>
    </ul>
  )
}
