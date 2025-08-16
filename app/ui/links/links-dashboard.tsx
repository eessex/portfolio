'use client'

import { PlusIcon } from '@heroicons/react/24/outline'
import { type Link as _Link } from '@/lib/definitions'
import { useCallback, useState } from 'react'
import AccordionDropdown from '@/ui/accordion-dropdown/accordion-dropdown'
import { LinkItem } from '@/ui/links/link-item'
import { Dialog } from '@/ui/dialog/dialog'
import { EditLink } from '@/ui/links/edit-link-form'
import { Form } from '@/ui/form/form'
import { editLink, deleteLink } from '@/lib/actions/links'
import { EditItemNav } from '@/ui/form/edit-item-nav'
import { eventUrl, releaseUrl } from '@/ui/util'
import Link from 'next/link'
import styles from '@/ui/links//links.module.scss'

type SavedLink = _Link & { id: string }

export function LinksDashboard ({ links }: { links: _Link[] }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [linkToEdit, setLinkToEdit] = useState<_Link | undefined>(undefined)

  const toggleExpand = () => setIsExpanded(!isExpanded)

  async function onSubmit (formData: FormData) {
    // handle form submission
    console.log('Form submitted:', formData)
    try {
      const res = await editLink(formData)
      setIsEditDialogOpen(false)
      setLinkToEdit(undefined)
      return res
    } catch (error) {
      console.error('Failed to submit form:', error)
    }
  }

  const onEdit = useCallback((id: string) => {
    const link = links.find(link => link.id === id)
    if (link) {
      setLinkToEdit(link)
      setIsEditDialogOpen(true)
    }
  }, [links])

  const onDelete = useCallback(async (id: string) => {
    try {
      await deleteLink(id)
      console.log('Delete link with id:', id)
    } catch (error) {
      console.error('Failed to delete link:', error)
    }
  }, [])

  return (
    <div>
      <header>
        <button className={`button ${styles['new-item']}`} onClick={() => setIsEditDialogOpen(true)}>
          <PlusIcon /> Add Link
        </button>

        <div className={styles['links-dashboard-header']}>
          <h2>All Links ({links.length})</h2>
          <button onClick={toggleExpand}>{isExpanded ? 'Collapse all' : 'Expand all'}</button>
        </div>
      </header>

      {isEditDialogOpen && (
        <Dialog
          title='Add Link'
          onClose={() => setIsEditDialogOpen(false)}
        >
          <Form action={onSubmit}>
            <EditLink
              link={linkToEdit}
            />
          </Form>
        </Dialog>
      )}

      <ul>
        {links
          .filter(link => !!link.id)
          .map((link) => (
            <LinkListItem
              key={link.id}
              link={(link as SavedLink)}
              isExpanded={isExpanded}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
      </ul>
    </div>
  )
}

function LinkListItem ({
  link, isExpanded, onEdit, onDelete
}: {
  link: SavedLink, isExpanded?: boolean, onEdit: (id: string) => void, onDelete: (id: string) => void
}) {
  function usedOnPages () {
    const events = link.eventSlugs?.map(slug => eventUrl(slug)) || []
    const releases = link.releaseSlugs?.map(slug => releaseUrl(slug)) || []
    return [...events, ...releases]
  }

  function linkTitle () {
    const usedOn = usedOnPages()
    const count = usedOn.length > 0 ? ` (${usedOn.length})` : ''

    if (link.title) return link.title + count
    if (link.url) return `${link.url}${count}`
    return 'Link without title' + count
  }

  return (
    <li key={link.id} className={styles['links-dashboard-list-item']}>
      <AccordionDropdown title={linkTitle()} isExpanded={isExpanded}>
        <EditItemNav id={link.id} onEdit={onEdit} onDelete={onDelete} />
        <Link href={link.url} target='_blank' rel='noopener noreferrer'>{link.url}</Link>
        <LinkItem link={link} />
        <div>ID: {link.id}</div>

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
