'use client'

import { deleteEmbedCode, editEmbedCode } from '@/lib/actions/embed-codes'
import type { EmbedCode, FormResponse } from '@/lib/definitions'
import { AccordionDropdown } from '@/ui/accordion-dropdown/accordion-dropdown'
import { Dialog } from '@/ui/dialog/dialog'
import styles from '@/ui/embed-codes//embed-codes.module.scss'
import { EditEmbedCode } from '@/ui/embed-codes/edit-embed-code-form'
import { EmbedCodeItem } from '@/ui/embed-codes/embed-code'
import { EditItemNav } from '@/ui/form/edit-item-nav'
import { Form } from '@/ui/form/form'
import { eventUrl, releaseUrl } from '@/ui/util'
import { PlusIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useCallback, useState } from 'react'

type SavedEmbedCode = EmbedCode & { id: string }

export function EmbedCodeDashboard ({ embedCodes }: { embedCodes: EmbedCode[] }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [embedCodeToEdit, setEmbedCodeToEdit] = useState<EmbedCode | undefined>(undefined)

  const toggleExpand = () => setIsExpanded(!isExpanded)

  async function onSubmit (formData: FormData): Promise<FormResponse<EmbedCode> | undefined> {
    try {
      const res = await editEmbedCode(formData)
      setIsEditDialogOpen(false)
      setEmbedCodeToEdit(undefined)
      return res
    } catch (error) {
      console.error('Failed to submit form:', error)
    }
  }

  function onCloseDialog () {
    setIsEditDialogOpen(false)
    setEmbedCodeToEdit(undefined)
  }

  const onEdit = useCallback((id: string) => {
    const embedCode = embedCodes.find(code => code.id === id)
    if (embedCode) {
      setEmbedCodeToEdit(embedCode)
      setIsEditDialogOpen(true)
    }
  }, [embedCodes])

  const onDelete = useCallback(async (id: string) => {
    try {
      await deleteEmbedCode(id)
      console.log('Delete embed code with id:', id)
    } catch (error) {
      console.error('Failed to delete embed code:', error)
    }
  }, [])

  return (
    <div>
      <header>
        <button className={`button ${styles['new-item']}`} onClick={() => setIsEditDialogOpen(true)}>
          <PlusIcon /> Add Embed Code
        </button>

        <div className={styles['embed-code-header']}>
          <h2>All embed Codes ({embedCodes.length})</h2>
          <button onClick={toggleExpand}>{isExpanded ? 'Collapse all' : 'Expand all'}</button>
        </div>
      </header>

      {isEditDialogOpen && (
        <Dialog
          title='Add Embed Code'
          onClose={onCloseDialog}
        >
          <Form action={onSubmit}>
            <EditEmbedCode
              embed={embedCodeToEdit}
            />
          </Form>
        </Dialog>
      )}

      <ul>
        {embedCodes
          .filter((code) => !!code.id)
          .map((code) => (
            <EmbedCodeListItem
              key={code.id}
              embedCode={(code as SavedEmbedCode)}
              isExpanded={isExpanded}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
      </ul>
    </div>
  )
}

function EmbedCodeListItem ({
  embedCode, isExpanded, onEdit, onDelete

}: {
  embedCode: SavedEmbedCode, isExpanded?: boolean, onEdit: (id: string) => void, onDelete: (id: string) => void
}) {
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
    const events = embedCode.eventSlugs?.map((slug) => eventUrl(slug)) || []
    const releases = embedCode.releaseSlugs?.map((slug) => releaseUrl(slug)) || []
    return [...events, ...releases]
  }

  function embedTitle () {
    const usedOn = usedOnPages()
    const count = usedOn.length > 0 ? ` (${usedOn.length})` : ''

    if (embedCode.title) return embedCode.title + count
    if (iframeHost) return `Embed Code from ${iframeHost}${count}`
    return 'Embed Code'
  }

  return (
    <li key={embedCode.id} className={styles['embed-code-list-item']} ref={containerRef}>
      <AccordionDropdown title={embedTitle()} isExpanded={isExpanded}>
        <EditItemNav id={embedCode.id} onEdit={onEdit} onDelete={onDelete} />
        <EmbedCodeItem embedCode={embedCode} />
        <div>ID: {embedCode.id}</div>

        <div>
          <h2>Visible on:</h2>
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
                <li>No pages yet.</li>
                )}
          </ul>
        </div>
      </AccordionDropdown>
    </li>
  )
}
