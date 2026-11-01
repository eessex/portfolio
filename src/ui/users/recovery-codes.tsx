'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import { regenerateRecoveryCodes } from '@/lib/users/actions'
import { RECOVERY_CODE_COUNT } from '@/lib/users/schemas'
import { Checkbox } from '@/ui/form/checkbox'
import { Form } from '@/ui/form/form'
import { useToast } from '@/ui/toast/toast-context'
import { CurrentPasswordInput } from '@/ui/users/current-password-input'
import styles from '@/ui/users/recovery-codes.module.scss'

/** Shown once, so Continue waits for the "saved" tick */
export function RecoveryCodesList({
  codes,
  onDone
}: {
  codes: string[]
  onDone: () => void
}) {
  const [isSaved, setIsSaved] = useState(false)
  const headingRef = useRef<HTMLHeadingElement>(null)
  // Replaces the focused submit button, so move focus here
  useEffect(() => headingRef.current?.focus(), [])
  const { addErrorMessage, addSuccessMessage } = useToast()
  const text = codes.join('\n')

  async function copyCodes() {
    try {
      await navigator.clipboard.writeText(text)
      addSuccessMessage('Recovery codes copied.')
    } catch {
      addErrorMessage('Couldn’t copy — select the codes instead.')
    }
  }

  function downloadCodes() {
    const url = URL.createObjectURL(
      new Blob([`${text}\n`], { type: 'text/plain' })
    )
    const link = document.createElement('a')
    link.href = url
    link.download = 'recovery-codes.txt'
    // Firefox/Safari ignore clicks on detached links
    document.body.append(link)
    link.click()
    link.remove()
    // Revoking in the same tick can cancel the download
    setTimeout(() => URL.revokeObjectURL(url))
  }

  return (
    <section
      className={styles['recovery-codes']}
      aria-labelledby='recovery-codes-heading'
    >
      <h2 id='recovery-codes-heading' ref={headingRef} tabIndex={-1}>
        Save your recovery codes
      </h2>
      <p>
        If you forget your password, use one of these on the login
        page&apos;s &ldquo;Forgot password?&rdquo; link to set a new
        one. Each works once. Store them in a password manager: this
        is the only time they&apos;re shown.
      </p>
      {/* list-style: none drops list semantics in Safari */}
      <ol className={styles.codes} role='list'>
        {codes.map((code) => (
          <li key={code}>{code}</li>
        ))}
      </ol>
      <div className={styles.actions}>
        <button type='button' onClick={copyCodes}>
          Copy
        </button>
        <button type='button' onClick={downloadCodes}>
          Download
        </button>
      </div>
      <Checkbox
        label='I’ve saved these codes'
        onChange={(event) => setIsSaved(event.target.checked)}
      />
      <div>
        <button
          type='button'
          className='button-lg button-primary'
          disabled={!isSaved}
          onClick={onDone}
        >
          Continue
        </button>
      </div>
    </section>
  )
}

/** The dashboard's count of codes left and "Generate new codes". */
export function RecoveryCodesForm({
  unusedCount
}: {
  unusedCount: number
}) {
  const [codes, setCodes] = useState<string[] | null>(null)
  const router = useRouter()

  if (codes) {
    return (
      <RecoveryCodesList
        codes={codes}
        onDone={() => {
          setCodes(null)
          router.refresh()
        }}
      />
    )
  }

  return (
    <Form
      action={regenerateRecoveryCodes}
      isUnsavedChangesConfirmed={false}
      isSubmittedUnchanged
      submitButtonText='Generate new codes'
      onSuccess={(res) => setCodes(res?.recoveryCodes ?? null)}
    >
      <p>
        {unusedCount
          ? `${unusedCount} of ${RECOVERY_CODE_COUNT} recovery codes left.`
          : 'You have no recovery codes left.'}{' '}
        Generating new codes replaces the old ones.
      </p>
      <CurrentPasswordInput />
    </Form>
  )
}
