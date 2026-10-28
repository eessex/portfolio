'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { capitalizeFirstLetter } from '@/lib/strings'
import type { FormResponse } from '@/lib/types'
import { Dialog } from '@/ui/dialog/dialog'
import styles from '@/ui/items/delete-item-button.module.scss'
import { useToast } from '@/ui/toast/toast-context'

export function DeleteItemButton<T>({
  deleteItem,
  itemLabel,
  redirectTo
}: {
  deleteItem: () => Promise<FormResponse<T>>
  itemLabel: string
  redirectTo: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const router = useRouter()
  const { addErrorMessage, addSuccessMessage } = useToast()

  async function handleConfirm() {
    setIsPending(true)
    const res = await deleteItem()
    setIsPending(false)

    if (!res?.ok) {
      addErrorMessage(
        res?.message || `Failed to delete ${itemLabel}.`
      )
      return
    }

    addSuccessMessage(`${capitalizeFirstLetter(itemLabel)} deleted.`)
    setIsOpen(false)
    router.push(redirectTo)
  }

  return (
    <>
      <button
        type='button'
        className={`button-sm ${styles['delete-button']}`}
        onClick={() => setIsOpen(true)}
      >
        Delete {itemLabel}
      </button>

      {isOpen && (
        <Dialog
          title={`Delete ${itemLabel}?`}
          onClose={() => setIsOpen(false)}
          cancelButtonText='Cancel'
          confirmButtonText={
            isPending ? 'Deleting…' : 'Confirm delete'
          }
          isLoading={isPending}
          onConfirm={handleConfirm}
        >
          <p>This can&apos;t be undone.</p>
        </Dialog>
      )}
    </>
  )
}
