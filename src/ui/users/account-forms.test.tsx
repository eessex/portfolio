import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {
  changeEmail,
  changeName,
  changePassword
} from '@/lib/users/actions'
import { useToast } from '@/ui/toast/toast-context'
import {
  EmailForm,
  NameForm,
  PasswordForm
} from '@/ui/users/account-forms'

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() }))
}))

jest.mock('@/lib/users/actions', () => ({
  changeEmail: jest.fn(),
  changeName: jest.fn(),
  changePassword: jest.fn()
}))
const mockChangeEmail = jest.mocked(changeEmail)
const mockChangeName = jest.mocked(changeName)
const mockChangePassword = jest.mocked(changePassword)

jest.mock('@/ui/toast/toast-context', () => ({ useToast: jest.fn() }))
;(useToast as jest.Mock).mockReturnValue({
  addErrorMessage: jest.fn(),
  addSuccessMessage: jest.fn(),
  removeMessage: jest.fn()
})

describe('NameForm', () => {
  beforeEach(() => jest.clearAllMocks())

  it('prefills and submits the name', async () => {
    mockChangeName.mockResolvedValue({ ok: true })
    const user = userEvent.setup()
    render(<NameForm name='Ada Lovelace' />)

    const name = screen.getByLabelText(/^name/i)
    expect(name).toHaveValue('Ada Lovelace')
    await user.clear(name)
    await user.type(name, 'Augusta Ada King')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(mockChangeName.mock.calls[0]?.[0].get('name')).toBe(
      'Augusta Ada King'
    )
  })
})

describe('EmailForm', () => {
  beforeEach(() => jest.clearAllMocks())

  it('submits the email with the current password', async () => {
    mockChangeEmail.mockResolvedValue({ ok: true })
    const user = userEvent.setup()
    render(<EmailForm email='ada@example.com' />)

    const email = screen.getByRole('textbox', { name: /email/i })
    expect(email).toHaveValue('ada@example.com')
    await user.clear(email)
    await user.type(email, 'new@example.com')
    await user.type(
      screen.getByLabelText(/current password/i),
      'current-password'
    )
    await user.click(screen.getByRole('button', { name: 'Save' }))

    const formData = mockChangeEmail.mock.calls[0]?.[0]
    expect(formData?.get('email')).toBe('new@example.com')
    expect(formData?.get('currentPassword')).toBe('current-password')
  })

  it('warns that saving signs out other devices', () => {
    render(<EmailForm email='ada@example.com' />)

    expect(
      screen.getByText(/signs you out on every other device/)
    ).toBeInTheDocument()
  })
})

describe('PasswordForm', () => {
  beforeEach(() => jest.clearAllMocks())

  it('shows a wrong current password inline', async () => {
    mockChangePassword.mockResolvedValue({
      ok: false,
      message: 'Failed to verify your password.',
      errors: { currentPassword: ['Incorrect password.'] }
    })
    const user = userEvent.setup()
    render(<PasswordForm />)

    await user.type(screen.getByLabelText(/current password/i), 'x')
    await user.type(
      screen.getByLabelText(/^new password/i),
      'a long enough new passphrase'
    )
    await user.type(
      screen.getByLabelText(/confirm new password/i),
      'a long enough new passphrase'
    )
    await user.click(
      screen.getByRole('button', { name: 'Change password' })
    )

    expect(
      await screen.findByText('Incorrect password.')
    ).toBeInTheDocument()
  })
})
