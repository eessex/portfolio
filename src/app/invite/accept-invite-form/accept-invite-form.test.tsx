import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { AcceptInviteForm } from '@/app/invite/accept-invite-form/accept-invite-form'
import { acceptInvite } from '@/lib/users/actions'
import { useToast } from '@/ui/toast/toast-context'

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() }))
}))

jest.mock('@/lib/users/actions', () => ({
  acceptInvite: jest.fn()
}))
const mockAcceptInvite = jest.mocked(acceptInvite)

jest.mock('@/ui/toast/toast-context', () => ({ useToast: jest.fn() }))
;(useToast as jest.Mock).mockReturnValue({
  addErrorMessage: jest.fn(),
  addSuccessMessage: jest.fn(),
  removeMessage: jest.fn()
})

const password = 'a long enough new passphrase'

// generateUserToken()'s shape
const token = 'A'.repeat(43)

describe('AcceptInviteForm', () => {
  beforeEach(() => jest.clearAllMocks())
  afterEach(() => {
    window.location.hash = ''
    sessionStorage.clear()
  })

  it('strips the token from the address bar but keeps it for a reload', () => {
    window.location.hash = `#${token}`
    const { unmount } = render(<AcceptInviteForm />)

    expect(window.location.hash).toBe('')
    unmount()
    render(<AcceptInviteForm />)
    expect(
      (
        document.querySelector(
          'input[name="token"]'
        ) as HTMLInputElement
      ).value
    ).toBe(token)
  })

  it('keeps the token when the skip link changes the fragment', () => {
    window.location.hash = `#${token}`
    render(<AcceptInviteForm />)

    act(() => {
      window.location.hash = '#content'
      window.dispatchEvent(new HashChangeEvent('hashchange'))
    })

    expect(window.location.hash).toBe('#content')
    expect(
      (
        document.querySelector(
          'input[name="token"]'
        ) as HTMLInputElement
      ).value
    ).toBe(token)
  })

  it('explains a link with no token', () => {
    render(<AcceptInviteForm />)

    expect(screen.getByText(/this link is incomplete/i)).toBeTruthy()
  })

  it('submits the fragment token with the account, then shows recovery codes', async () => {
    window.location.hash = `#${token}`
    mockAcceptInvite.mockResolvedValue({
      ok: true,
      res: { recoveryCodes: ['AAAAA-AAAAA'] }
    })
    const user = userEvent.setup()
    render(<AcceptInviteForm />)

    await user.type(screen.getByLabelText(/^name/i), 'Grace Hopper')
    await user.type(
      screen.getByRole('textbox', { name: /email/i }),
      'grace@example.com'
    )
    await user.type(screen.getByLabelText(/^password/i), password)
    await user.type(
      screen.getByLabelText(/confirm password/i),
      password
    )
    await user.click(
      screen.getByRole('button', { name: 'Create account' })
    )

    const formData = mockAcceptInvite.mock.calls[0]?.[0]
    expect(formData?.get('token')).toBe(token)
    expect(formData?.get('newPassword')).toBe(password)
    expect(screen.getByText('AAAAA-AAAAA')).toBeTruthy()
  })
})
