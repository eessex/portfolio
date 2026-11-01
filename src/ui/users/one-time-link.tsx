'use client'

import { useEffect, useRef, useSyncExternalStore } from 'react'

import { DEFAULT_TIME_ZONE } from '@/lib/dates'
import {
  USER_TOKEN_PATTERN,
  USER_TOKEN_TTL_HOURS
} from '@/lib/users/schemas'
import { Input } from '@/ui/form/input'
import { formattedDateTime } from '@/ui/format/dates'
import { useToast } from '@/ui/toast/toast-context'
import styles from '@/ui/users/users.module.scss'

export const INVITE_PATH = '/invite'
export const RESET_PASSWORD_PATH = '/reset-password'

/**
 * A link just created by an admin, shown once. The token goes in the
 * fragment, which browsers never send to a server or in a Referer.
 */
export function OneTimeLink({
  path,
  token,
  expiresAt,
  children
}: {
  path: typeof INVITE_PATH | typeof RESET_PASSWORD_PATH
  token: string
  expiresAt: string
  /** What the link does, for whoever it's sent to */
  children: React.ReactNode
}) {
  const url = `${window.location.origin}${path}#${token}`
  const { addErrorMessage, addSuccessMessage } = useToast()
  const inputRef = useRef<HTMLInputElement>(null)
  // Replaces the focused submit button, so move focus here
  useEffect(() => inputRef.current?.select(), [])

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url)
      addSuccessMessage('Link copied.')
    } catch {
      addErrorMessage('Couldn’t copy — select the link instead.')
    }
  }

  return (
    <div className={styles['one-time-link']}>
      <p>{children}</p>
      <Input
        label='Link'
        value={url}
        ref={(el) => {
          inputRef.current = el
        }}
        attributes={{ readOnly: true, name: 'link' }}
      />
      <div>
        <button type='button' onClick={copyLink}>
          Copy link
        </button>
      </div>
      <p>
        Works once, until {formattedDateTime(expiresAt, 'lg', DEFAULT_TIME_ZONE)}. This is the
        only time it&apos;s shown, so send it privately now.
      </p>
    </div>
  )
}

export const ONE_TIME_LINK_NOTE = `Links work once and expire after ${USER_TOKEN_TTL_HOURS} hours.`

export const INCOMPLETE_LINK_MESSAGE =
  'This link is incomplete. Copy the whole link you were sent, or ask an admin for a new one.'

function subscribeToHash(onChange: () => void) {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

// Per tab, so a reload still works once the fragment is stripped
const tokenStorageKey = () => `link-token:${window.location.pathname}`
// When sessionStorage is unavailable
let fallbackToken = ''

// Only a token, not another in-page anchor like the skip link's
function hashToken(): string {
  const hash = window.location.hash.slice(1)
  return USER_TOKEN_PATTERN.test(hash) ? hash : ''
}

function readLinkToken(): string {
  const hash = hashToken()
  if (hash) fallbackToken = hash
  try {
    if (hash) sessionStorage.setItem(tokenStorageKey(), hash)
    return hash || sessionStorage.getItem(tokenStorageKey()) || ''
  } catch {
    return hash || fallbackToken
  }
}

/**
 * The token from a one-time link's fragment: `null` until hydrated
 * (the server never sees it), `''` when the link has none. Strips it
 * from the address bar so it doesn't linger in history.
 */
export function useLinkToken(): string | null {
  const token = useSyncExternalStore(
    subscribeToHash,
    readLinkToken,
    () => null
  )
  useEffect(() => {
    if (!token || !hashToken()) return
    const { pathname, search } = window.location
    window.history.replaceState(
      window.history.state,
      '',
      pathname + search
    )
  }, [token])
  return token
}
