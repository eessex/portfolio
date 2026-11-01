import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ForgotPasswordForm } from '@/app/forgot-password/forgot-password-form/forgot-password-form'
import { recoverAccount } from '@/lib/users/actions'
import { useToast } from '@/ui/toast/toast-context'

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() }))
}))

jest.mock('@/lib/users/actions', () => ({
  recoverAccount: jest.fn()
}))
const mockRecoverAccount = jest.mocked(recoverAccount)

jest.mock('@/ui/toast/toast-context', () => ({ useToast: jest.fn() }))
const mockAddError = jest.fn()
;(useToast as jest.Mock).mockReturnValue({
  addErrorMessage: mockAddError,
  addSuccessMessage: jest.fn(),
  removeMessage: jest.fn()
})

const newPassword = 'a long enough new passphrase'

async function fillAndSubmit() {
  const user = userEvent.setup()
  render(<ForgotPasswordForm />)

  await user.type(
    screen.getByRole('textbox', { name: /email/i }),
    'ada@example.com'
  )
  await user.type(
    screen.getByLabelText(/recovery code/i),
    'AAAAA-AAAAA'
  )
  await user.type(
    screen.getByLabelText(/^new password/i),
    newPassword
  )
  await user.type(
    screen.getByLabelText(/confirm new password/i),
    newPassword
  )
  await user.click(
    screen.getByRole('button', { name: 'Set new password' })
  )
}

describe('ForgotPasswordForm', () => {
  beforeEach(() => jest.clearAllMocks())

  it('submits the email, code and new password', async () => {
    mockRecoverAccount.mockResolvedValue({ ok: true })

    await fillAndSubmit()

    const formData = mockRecoverAccount.mock.calls[0]?.[0]
    expect(formData?.get('email')).toBe('ada@example.com')
    expect(formData?.get('code')).toBe('AAAAA-AAAAA')
    expect(formData?.get('newPassword')).toBe(newPassword)
    expect(formData?.get('confirmPassword')).toBe(newPassword)
  })

  it('shows a mismatch as a top-level message', async () => {
    mockRecoverAccount.mockResolvedValue({
      ok: false,
      message: "That email and recovery code don't match."
    })

    await fillAndSubmit()

    expect(mockAddError).toHaveBeenCalledWith(
      "That email and recovery code don't match."
    )
  })

  it('shows a breached password as a field error', async () => {
    mockRecoverAccount.mockResolvedValue({
      ok: false,
      message: 'Failed to validate password.',
      errors: {
        newPassword: [
          'This password has appeared in a data breach. Choose another.'
        ]
      }
    })

    await fillAndSubmit()

    expect(
      await screen.findByText(/appeared in a data breach/)
    ).toBeInTheDocument()
  })
})
