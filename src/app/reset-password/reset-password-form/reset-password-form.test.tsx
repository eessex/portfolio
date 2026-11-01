import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ResetPasswordForm } from '@/app/reset-password/reset-password-form/reset-password-form'
import { resetPasswordWithLink } from '@/lib/users/actions'
import { useToast } from '@/ui/toast/toast-context'

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() }))
}))

jest.mock('@/lib/users/actions', () => ({
  resetPasswordWithLink: jest.fn()
}))
const mockReset = jest.mocked(resetPasswordWithLink)

jest.mock('@/ui/toast/toast-context', () => ({ useToast: jest.fn() }))
;(useToast as jest.Mock).mockReturnValue({
  addErrorMessage: jest.fn(),
  addSuccessMessage: jest.fn(),
  removeMessage: jest.fn()
})

const password = 'a long enough new passphrase'

// generateUserToken()'s shape
const token = 'A'.repeat(43)

describe('ResetPasswordForm', () => {
  beforeEach(() => jest.clearAllMocks())
  afterEach(() => {
    window.location.hash = ''
    sessionStorage.clear()
  })

  it('strips the token from the address bar but keeps it for a reload', () => {
    window.location.hash = `#${token}`
    const { unmount } = render(<ResetPasswordForm />)

    expect(window.location.hash).toBe('')
    unmount()
    render(<ResetPasswordForm />)
    expect(
      (
        document.querySelector(
          'input[name="token"]'
        ) as HTMLInputElement
      ).value
    ).toBe(token)
  })

  it('explains a link with no token', () => {
    render(<ResetPasswordForm />)

    expect(screen.getByText(/this link is incomplete/i)).toBeTruthy()
  })

  it('submits the fragment token with the new password', async () => {
    window.location.hash = `#${token}`
    mockReset.mockResolvedValue({ ok: true })
    const user = userEvent.setup()
    render(<ResetPasswordForm />)

    await user.type(screen.getByLabelText(/^new password/i), password)
    await user.type(
      screen.getByLabelText(/confirm new password/i),
      password
    )
    await user.click(
      screen.getByRole('button', { name: 'Set new password' })
    )

    const formData = mockReset.mock.calls[0]?.[0]
    expect(formData?.get('token')).toBe(token)
    expect(formData?.get('newPassword')).toBe(password)
  })
})
