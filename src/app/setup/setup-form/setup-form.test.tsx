import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { SetupForm } from '@/app/setup/setup-form/setup-form'
import { completeSetup } from '@/lib/users/actions'
import { useToast } from '@/ui/toast/toast-context'

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() }))
}))

jest.mock('@/lib/users/actions', () => ({
  completeSetup: jest.fn()
}))
const mockCompleteSetup = jest.mocked(completeSetup)

jest.mock('@/ui/toast/toast-context', () => ({ useToast: jest.fn() }))
const mockAddError = jest.fn()
const mockAddSuccess = jest.fn()
;(useToast as jest.Mock).mockReturnValue({
  addErrorMessage: mockAddError,
  addSuccessMessage: mockAddSuccess,
  removeMessage: jest.fn()
})

async function fillAndSubmit(
  overrides: Partial<{
    code: string
    name: string
    email: string
    password: string
    confirmPassword: string
  }> = {}
) {
  const values = {
    code: 'K7QM-3XRD-PW9T-H2FC',
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    password: 'super-secret',
    confirmPassword: 'super-secret',
    ...overrides
  }
  const user = userEvent.setup()
  render(<SetupForm />)

  await user.type(screen.getByLabelText(/setup code/i), values.code)
  await user.type(screen.getByLabelText(/^name/i), values.name)
  await user.type(
    screen.getByRole('textbox', { name: /email/i }),
    values.email
  )
  await user.type(
    screen.getByLabelText(/^password/i),
    values.password
  )
  await user.type(
    screen.getByLabelText(/confirm password/i),
    values.confirmPassword
  )
  await user.click(
    screen.getByRole('button', { name: /create account/i })
  )
}

describe('SetupForm', () => {
  beforeEach(() => jest.clearAllMocks())

  it('renders the setup code, account fields, and submit button', () => {
    render(<SetupForm />)

    expect(screen.getByLabelText(/setup code/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^name/i)).toBeInTheDocument()
    expect(
      screen.getByRole('textbox', { name: /email/i })
    ).toBeInTheDocument()
    expect(screen.getByLabelText(/^password/i)).toBeInTheDocument()
    expect(
      screen.getByLabelText(/confirm password/i)
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /create account/i })
    ).toBeInTheDocument()
  })

  it('submits every field to completeSetup', async () => {
    mockCompleteSetup.mockResolvedValue({ ok: true })

    await fillAndSubmit()

    expect(mockCompleteSetup).toHaveBeenCalledTimes(1)
    const formData = mockCompleteSetup.mock.calls[0][0]
    expect(formData.get('code')).toBe('K7QM-3XRD-PW9T-H2FC')
    expect(formData.get('name')).toBe('Ada Lovelace')
    expect(formData.get('email')).toBe('ada@example.com')
    expect(formData.get('password')).toBe('super-secret')
    expect(formData.get('confirmPassword')).toBe('super-secret')
  })

  it('shows a top-level message for a wrong code', async () => {
    mockCompleteSetup.mockResolvedValue({
      ok: false,
      message: "That code doesn't match."
    })

    await fillAndSubmit()

    expect(mockAddError).toHaveBeenCalledWith(
      "That code doesn't match."
    )
  })

  it('shows a field error for mismatched passwords', async () => {
    mockCompleteSetup.mockResolvedValue({
      ok: false,
      message: 'Failed to validate account details.',
      errors: { confirmPassword: ['Passwords must match.'] }
    })

    await fillAndSubmit({ confirmPassword: 'different' })

    expect(
      await screen.findByText('Passwords must match.')
    ).toBeInTheDocument()
    // field errors suppress the generic toast (see Form's own tests)
    expect(mockAddError).not.toHaveBeenCalled()
  })
})
