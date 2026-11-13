'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { DEFAULT_TIME_ZONE } from '@/lib/dates'
import type { FormResponse } from '@/lib/types'
import {
  createResetLink,
  inviteUser,
  removeUser,
  revokeInvite,
  type UserLink
} from '@/lib/users/actions'
import type { PendingInvite } from '@/lib/users/tokens'
import type { UserSummary } from '@/lib/users/types'
import dashboardStyles from '@/ui/dashboard/dashboard.module.scss'
import tableStyles from '@/ui/data-table/data-table.module.scss'
import { Dialog } from '@/ui/dialog/dialog'
import { Form } from '@/ui/form/form'
import { formattedDateTime } from '@/ui/format/dates'
import { useToast } from '@/ui/toast/toast-context'
import { CurrentPasswordInput } from '@/ui/users/current-password-input'
import {
  INVITE_PATH,
  ONE_TIME_LINK_NOTE,
  OneTimeLink,
  RESET_PASSWORD_PATH
} from '@/ui/users/one-time-link'
import styles from '@/ui/users/users.module.scss'

export function UsersManager({
  users,
  invites,
  currentUserId
}: {
  users: UserSummary[]
  invites: PendingInvite[]
  currentUserId: string
}) {
  return (
    <>
      <section
        aria-labelledby='admins-heading'
        className={dashboardStyles['dashboard-inner']}
      >
        <h2 id='admins-heading'>Admins</h2>
        <UsersTable users={users} currentUserId={currentUserId} />
      </section>

      <section
        aria-labelledby='invites-heading'
        className={`${dashboardStyles['dashboard-inner']} ${styles.invites}`}
      >
        <h2 id='invites-heading'>Invite an admin</h2>
        <p>
          Every admin can edit the whole site and manage other admins.{' '}
          {ONE_TIME_LINK_NOTE}
        </p>
        <InviteForm />
        {invites.length > 0 && <PendingInvites invites={invites} />}
      </section>
    </>
  )
}

function UsersTable({
  users,
  currentUserId
}: {
  users: UserSummary[]
  currentUserId: string
}) {
  return (
    <table className={tableStyles['data-table']}>
      <thead>
        <tr>
          <th scope='col'>Name</th>
          <th scope='col'>Email</th>
          <th scope='col'>Added</th>
          <th scope='col'>Last login</th>
          <th scope='col'>
            <span className='visually-hidden'>Actions</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user.id}>
            <th scope='row'>
              {user.name}
              {user.id === currentUserId && ' (you)'}
            </th>
            <td>{user.email}</td>
            <td>
              <span className={tableStyles['cell-label']}>
                Added{' '}
              </span>
              {formattedTimestamp(user.createdAt, 'md')}
            </td>
            <td>
              <span className={tableStyles['cell-label']}>
                Last login{' '}
              </span>
              {user.lastLoginAt
                ? formattedTimestamp(user.lastLoginAt)
                : 'Never'}
            </td>
            <td>
              {user.id !== currentUserId && (
                <UserActions user={user} />
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

// Timestamps, not dates: formattedDateTime shifts a tz-less value
function formattedTimestamp(date: Date, format?: 'md' | 'lg') {
  return formattedDateTime(date, format, DEFAULT_TIME_ZONE)
}

function UserActions({ user }: { user: UserSummary }) {
  const [openDialog, setOpenDialog] = useState<
    'reset' | 'remove' | null
  >(null)
  const [resetLink, setResetLink] = useState<UserLink>()
  const router = useRouter()
  const { addSuccessMessage } = useToast()

  function close() {
    setOpenDialog(null)
    setResetLink(undefined)
  }

  return (
    <div className={styles.actions}>
      <button
        type='button'
        className='button-sm'
        onClick={() => setOpenDialog('reset')}
      >
        Create reset link
      </button>
      <button
        type='button'
        className='button-sm'
        onClick={() => setOpenDialog('remove')}
      >
        Remove
      </button>

      {openDialog === 'reset' && (
        <Dialog
          title={`Reset link for ${user.name}`}
          cancelButtonText={resetLink ? 'Done' : 'Cancel'}
          confirmButtonText=''
          onConfirm={close}
          onClose={close}
        >
          {resetLink ? (
            <OneTimeLink
              path={RESET_PASSWORD_PATH}
              token={resetLink.token}
              expiresAt={resetLink.expiresAt}
            >
              Send this to {user.name}. Opening it lets them set a new
              password, which signs them out everywhere else.
            </OneTimeLink>
          ) : (
            <PasswordConfirmForm
              action={createResetLink}
              userId={user.id}
              submitButtonText='Create reset link'
              onSuccess={(res) => res && setResetLink(res)}
            >
              Any earlier reset link for {user.name} stops working.
            </PasswordConfirmForm>
          )}
        </Dialog>
      )}

      {openDialog === 'remove' && (
        <Dialog
          title={`Remove ${user.name}?`}
          cancelButtonText='Cancel'
          confirmButtonText=''
          onConfirm={close}
          onClose={close}
        >
          <PasswordConfirmForm
            action={removeUser}
            userId={user.id}
            submitButtonText='Remove admin'
            onSuccess={() => {
              close()
              addSuccessMessage(`${user.name} removed.`)
              router.refresh()
            }}
          >
            They&apos;re signed out everywhere and their invite and
            reset links stop working. This can&apos;t be undone.
          </PasswordConfirmForm>
        </Dialog>
      )}
    </div>
  )
}

/** Acting on another admin re-checks your own password */
function PasswordConfirmForm<T>({
  action,
  userId,
  submitButtonText,
  onSuccess,
  children
}: {
  action: (formData: FormData) => Promise<FormResponse<T>>
  userId?: string
  submitButtonText: string
  onSuccess: (res?: T) => void
  children: React.ReactNode
}) {
  return (
    <Form
      action={action}
      isUnsavedChangesConfirmed={false}
      isSubmittedUnchanged
      submitButtonText={submitButtonText}
      onSuccess={onSuccess}
    >
      <p>{children}</p>
      {userId && <input type='hidden' name='userId' value={userId} />}
      <CurrentPasswordInput />
    </Form>
  )
}

function InviteForm() {
  const [invite, setInvite] = useState<UserLink>()
  const router = useRouter()

  if (invite) {
    return (
      <>
        <OneTimeLink
          path={INVITE_PATH}
          token={invite.token}
          expiresAt={invite.expiresAt}
        >
          Send this to the new admin. Opening it lets them choose
          their own name, email and password.
        </OneTimeLink>
        <div>
          <button type='button' onClick={() => setInvite(undefined)}>
            Done
          </button>
        </div>
      </>
    )
  }

  return (
    <PasswordConfirmForm
      action={inviteUser}
      submitButtonText='Create invite link'
      onSuccess={(res) => {
        if (!res) return
        setInvite(res)
        router.refresh()
      }}
    >
      Creates a one-time link to send however you like.
    </PasswordConfirmForm>
  )
}

function PendingInvites({ invites }: { invites: PendingInvite[] }) {
  return (
    <>
      <h3>Pending invites</h3>
      {/* list-style: none drops list semantics in Safari */}
      <ul className={styles['invite-list']} role='list'>
        {invites.map((invite) => (
          <li key={invite.id}>
            <span>
              Created by {invite.createdByName}, expires{' '}
              {formattedTimestamp(invite.expiresAt)}
            </span>
            <RevokeInviteButton id={invite.id} />
          </li>
        ))}
      </ul>
    </>
  )
}

function RevokeInviteButton({ id }: { id: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const router = useRouter()
  const { addErrorMessage, addSuccessMessage } = useToast()

  async function handleConfirm() {
    setIsPending(true)
    const formData = new FormData()
    formData.set('inviteId', id)
    let res: Awaited<ReturnType<typeof revokeInvite>>
    try {
      res = await revokeInvite(formData)
    } catch {
      addErrorMessage('Failed to revoke invite, try again.')
      return
    } finally {
      setIsPending(false)
    }

    if (!res?.ok) {
      addErrorMessage(res?.message || 'Failed to revoke invite.')
      // It may have been used or revoked meanwhile
      router.refresh()
      return
    }
    addSuccessMessage('Invite revoked.')
    setIsOpen(false)
    router.refresh()
  }

  return (
    <>
      <button
        type='button'
        className='button-sm'
        onClick={() => setIsOpen(true)}
      >
        Revoke
      </button>

      {isOpen && (
        <Dialog
          title='Revoke invite?'
          onClose={() => setIsOpen(false)}
          cancelButtonText='Cancel'
          confirmButtonText={
            isPending ? 'Revoking…' : 'Revoke invite'
          }
          isLoading={isPending}
          onConfirm={handleConfirm}
        >
          <p>
            The link stops working. You can create a new one anytime.
          </p>
        </Dialog>
      )}
    </>
  )
}
