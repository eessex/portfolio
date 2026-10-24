'use client'

import { useRouter } from 'next/navigation'

import { type PagePath, pagePathSingulars } from '@/lib/schemas'
import type { FormResponse } from '@/lib/types'
import { Form } from '@/ui/form/form'
import styles from '@/ui/form/form.module.scss'
import { DeleteItemButton } from '@/ui/items/delete-item-button'

/**
 * Edit form for a page item: saves through `action`, then opens the
 * saved item's page (`/{path}/{slug}`, or `savedHref`), with a Delete
 * button below the form when `deleteItem` is given.
 */
export function ItemEditForm<T extends { slug: string }>({
  action,
  children,
  deleteItem,
  path,
  savedHref = (item) => `/${path}/${item.slug}`
}: {
  action: (formData: FormData) => Promise<FormResponse<T>>
  children: React.ReactNode
  /** Omit to hide the Delete button (e.g. a new item). */
  deleteItem?: () => Promise<FormResponse<unknown>>
  path: PagePath
  savedHref?: (item: T) => string
}) {
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    const res = await action(formData)
    if (res?.ok && res.res) router.push(savedHref(res.res))
    return res
  }

  return (
    <>
      <Form action={handleSubmit}>{children}</Form>

      {deleteItem && (
        <div className={styles['delete-button-container']}>
          <DeleteItemButton
            deleteItem={deleteItem}
            itemLabel={pagePathSingulars[path]}
            redirectTo={`/${path}`}
          />
        </div>
      )}
    </>
  )
}
