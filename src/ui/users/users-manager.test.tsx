import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {
  createResetLink,
  inviteUser,
  removeUser,
  revokeInvite
} from '@/lib/users/actions'
import { useToast } from '@/ui/toast/toast-context'
import { UsersManager } from '@/ui/users/users-manager'

const mockRefresh = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    refresh: mockRefresh
  }))
}))

jest.mock('@/lib/users/actions', () => ({
  createResetLink: jest.fn(),
  inviteUser: jest.fn(),
  removeUser: jest.fn(),
  revokeInvite: jest.fn()
}))
const mockCreateResetLink = jest.mocked(createResetLink)
const mockInviteUser = jest.mocked(inviteUser)
const mockRemoveUser = jest.mocked(removeUser)
const mockRevokeInvite = jest.mocked(revokeInvite)

jest.mock('@/ui/toast/toast-context', () => ({ useToast: jest.fn() }))
const mockAddSuccess = jest.fn()
const mockAddError = jest.fn()
;(useToast as jest.Mock).mockReturnValue({
  addErrorMessage: mockAddError,
  addSuccessMessage: mockAddSuccess,
  removeMessage: jest.fn()
})

const me = {
  id: 'user-me',
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  createdAt: new Date('2026-01-01T12:00:00Z'),
  lastLoginAt: new Date('2026-11-01T12:00:00Z')
}
const other = {
  id: 'user-other',
  name: 'Grace Hopper',
  email: 'grace@example.com',
  createdAt: new Date('2026-02-01T12:00:00Z')
}
const invite = {
  id: 'invite-1',
  createdAt: new Date('2026-11-01T12:00:00Z'),
  expiresAt: new Date('2026-11-04T12:00:00Z'),
  createdByName: 'Ada Lovelace'
}
const link = {
  token: 'A'.repeat(43),
  expiresAt: '2026-11-04T12:00:00.000Z'
}

function renderManager(invites = [invite]) {
  return render(
    <UsersManager
      users={[me, other]}
      invites={invites}
      currentUserId={me.id}
    />
  )
}

function rowFor(name: string) {
  return screen.getByRole('rowheader', { name: new RegExp(name) })
    .parentElement as HTMLElement
}

describe('UsersManager', () => {
  beforeEach(() => jest.clearAllMocks())

  it('lists admins, with actions only on other accounts', () => {
    renderManager()

    const myRow = rowFor('Ada Lovelace')
    expect(myRow).toHaveTextContent('(you)')
    expect(within(myRow).queryByRole('button')).toBeNull()
    expect(
      within(rowFor('Grace Hopper')).getByText('Never')
    ).toBeTruthy()
    expect(
      within(rowFor('Grace Hopper')).getByRole('button', {
        name: 'Remove'
      })
    ).toBeTruthy()
  })

  it('creates a reset link after the password check and shows it once', async () => {
    mockCreateResetLink.mockResolvedValue({ ok: true, res: link })
    const user = userEvent.setup()
    renderManager()

    await user.click(
      within(rowFor('Grace Hopper')).getByRole('button', {
        name: 'Create reset link'
      })
    )
    const dialog = within(screen.getByRole('dialog'))
    await user.type(
      dialog.getByLabelText(/current password/i),
      'my-password'
    )
    await user.click(
      dialog.getByRole('button', { name: 'Create reset link' })
    )

    const formData = mockCreateResetLink.mock.calls[0]?.[0]
    expect(formData?.get('userId')).toBe(other.id)
    expect(formData?.get('currentPassword')).toBe('my-password')
    expect(
      screen.getByRole('textbox', { name: /link/i })
    ).toHaveValue(`${window.location.origin}/reset-password#${'A'.repeat(43)}`)
  })

  it('removes an admin and refreshes the list', async () => {
    mockRemoveUser.mockResolvedValue({ ok: true })
    const user = userEvent.setup()
    renderManager()

    await user.click(
      within(rowFor('Grace Hopper')).getByRole('button', {
        name: 'Remove'
      })
    )
    const dialog = within(screen.getByRole('dialog'))
    await user.type(
      dialog.getByLabelText(/current password/i),
      'my-password'
    )
    await user.click(
      dialog.getByRole('button', { name: 'Remove admin' })
    )

    expect(mockRemoveUser.mock.calls[0]?.[0].get('userId')).toBe(
      other.id
    )
    expect(mockAddSuccess).toHaveBeenCalledWith(
      'Grace Hopper removed.'
    )
    expect(mockRefresh).toHaveBeenCalled()
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('creates an invite link', async () => {
    mockInviteUser.mockResolvedValue({ ok: true, res: link })
    const user = userEvent.setup()
    renderManager([])

    await user.type(
      screen.getByLabelText(/current password/i),
      'my-password'
    )
    await user.click(
      screen.getByRole('button', { name: 'Create invite link' })
    )

    expect(
      screen.getByRole('textbox', { name: /link/i })
    ).toHaveValue(`${window.location.origin}/invite#${'A'.repeat(43)}`)
    expect(mockRefresh).toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'Done' }))
    expect(
      screen.getByRole('button', { name: 'Create invite link' })
    ).toBeTruthy()
  })

  it('revokes a pending invite', async () => {
    mockRevokeInvite.mockResolvedValue({ ok: true })
    const user = userEvent.setup()
    renderManager()

    await user.click(screen.getByRole('button', { name: 'Revoke' }))
    await user.click(
      screen.getByRole('button', { name: 'Revoke invite' })
    )

    expect(mockRevokeInvite.mock.calls[0]?.[0].get('inviteId')).toBe(
      invite.id
    )
    expect(mockRefresh).toHaveBeenCalled()
  })

  it('re-enables revoking after a failed request', async () => {
    mockRevokeInvite.mockRejectedValueOnce(new Error('offline'))
    const user = userEvent.setup()
    renderManager()

    await user.click(screen.getByRole('button', { name: 'Revoke' }))
    await user.click(
      screen.getByRole('button', { name: 'Revoke invite' })
    )

    expect(mockAddError).toHaveBeenCalledWith(
      'Failed to revoke invite, try again.'
    )
    expect(
      screen.getByRole('button', { name: 'Revoke invite' })
    ).toBeEnabled()
  })

  it('formats timestamps in the site timezone and labels date cells', () => {
    renderManager()

    // 12:00 UTC is 7 AM in New York
    expect(screen.getByText(/expires.*7:00 AM/)).toBeTruthy()
    const row = rowFor('Ada Lovelace')
    expect(row).toHaveTextContent('Added')
    expect(row).toHaveTextContent('Last login')
  })
})
