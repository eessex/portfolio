import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { LoginForm } from '@/app/login/login-form/login-form'
import type { FormResponse } from '@/lib/types'
import { authenticate } from '@/lib/users/actions'
import { useToast } from '@/ui/toast/toast-context'

let mockSearchParams = new URLSearchParams()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  useSearchParams: () => mockSearchParams
}))

jest.mock('@/lib/users/actions', () => ({ authenticate: jest.fn() }))
const mockAuthenticate = authenticate as jest.MockedFunction<
  typeof authenticate
>
const successResponse: FormResponse<Record<string, never>> = {
  ok: true
}

jest.mock('@/ui/toast/toast-context', () => {
  return { useToast: jest.fn() }
})
const mockAddError = jest.fn()
const mockAddSuccess = jest.fn()
;(useToast as jest.Mock).mockReturnValue({
  addErrorMessage: mockAddError,
  addSuccessMessage: mockAddSuccess,
  removeMessage: jest.fn()
})

function renderComponent() {
  return render(<LoginForm />)
}

describe('LoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSearchParams = new URLSearchParams()
  })

  describe('redirect target', () => {
    it('returns to the page that bounced to login', () => {
      mockSearchParams = new URLSearchParams({
        callbackUrl: 'http://localhost:3000/events/new'
      })
      const { container } = renderComponent()

      expect(
        container.querySelector('input[name="redirectTo"]')
      ).toHaveValue('/events/new')
    })

    it('never redirects offsite', () => {
      mockSearchParams = new URLSearchParams({
        callbackUrl: '//evil.example'
      })
      const { container } = renderComponent()

      expect(
        container.querySelector('input[name="redirectTo"]')
      ).toHaveValue('/')
    })
  })

  describe('rendering', () => {
    it('renders email, password, and hidden redirect fields', () => {
      renderComponent()

      expect(
        screen.getByRole('textbox', { name: /email/i })
      ).toBeInTheDocument()
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
      const redirectInput = screen.getByDisplayValue('/')
      expect(redirectInput).toHaveAttribute('type', 'hidden')
      expect(redirectInput).toHaveAttribute('name', 'redirectTo')
    })

    it('renders submit button with text "Log in"', () => {
      renderComponent()
      const button = screen.getByRole('button', { name: /log in/i })

      expect(button).toBeInTheDocument()
      expect(button).toHaveAttribute('type', 'submit')
    })
  })

  describe('form submission', () => {
    it('calls authenticate with form data when submitted', async () => {
      const user = userEvent.setup()
      mockAuthenticate.mockResolvedValue(successResponse)
      renderComponent()

      await user.type(
        screen.getByRole('textbox', { name: /email/i }),
        'test@example.com'
      )
      await user.type(
        screen.getByLabelText(/password/i),
        'password123'
      )
      await user.click(
        screen.getByRole('button', { name: /log in/i })
      )

      expect(mockAuthenticate).toHaveBeenCalledTimes(1)

      const formDataArg = mockAuthenticate.mock.calls[0][0]
      expect(formDataArg).toBeInstanceOf(FormData)

      expect(formDataArg.get('email')).toBe('test@example.com')
      expect(formDataArg.get('password')).toBe('password123')
      expect(formDataArg.get('redirectTo')).toBe('/')
    })

    it('passes email, password, and redirectTo values in submitted FormData', async () => {
      const user = userEvent.setup()
      const successResponse: FormResponse<Record<string, never>> = {
        ok: true
      }
      mockAuthenticate.mockResolvedValue(successResponse)
      renderComponent()

      await user.type(
        screen.getByRole('textbox', { name: /email/i }),
        'test@example.com'
      )
      await user.type(
        screen.getByLabelText(/password/i),
        'supersecret'
      )
      await user.click(
        screen.getByRole('button', { name: /log in/i })
      )

      expect(mockAuthenticate).toHaveBeenCalledTimes(1)
      const req = mockAuthenticate.mock.calls[0][0]

      expect(req.get('email')).toBe('test@example.com')
      expect(req.get('password')).toBe('supersecret')
      expect(req.get('redirectTo')).toBe('/')
    })
  })

  describe('successful authentication', () => {
    it('does not display an error message when authentication succeeds', async () => {
      const user = userEvent.setup()
      mockAuthenticate.mockResolvedValue({ ok: true })
      renderComponent()

      await user.type(
        screen.getByRole('textbox', { name: /email/i }),
        'test@example.com'
      )
      await user.type(
        screen.getByLabelText(/password/i),
        'supersecret'
      )
      await user.click(
        screen.getByRole('button', { name: /log in/i })
      )

      expect(mockAuthenticate).toHaveBeenCalledTimes(1)
      expect(mockAddError).not.toHaveBeenCalled()
      expect(mockAddSuccess).toHaveBeenCalledWith('Changes saved.')
    })

    it('allows redirect to occur on success', async () => {
      const user = userEvent.setup()
      mockAuthenticate.mockResolvedValue({ ok: true })
      renderComponent()

      await user.type(
        screen.getByRole('textbox', { name: /email/i }),
        'test@example.com'
      )
      await user.type(
        screen.getByLabelText(/password/i),
        'supersecret'
      )
      await user.click(
        screen.getByRole('button', { name: /log in/i })
      )

      expect(mockAuthenticate).toHaveBeenCalledTimes(1)
      const res = mockAuthenticate.mock.calls[0][0]

      const redirectTo = res.get('redirectTo')
      expect(redirectTo).toBe('/')
    })
  })

  describe('authentication errors', () => {
    it('displays the message from a failed authenticate response', async () => {
      const user = userEvent.setup()
      mockAuthenticate.mockResolvedValue({
        ok: false,
        message: 'Invalid credentials.'
      })
      renderComponent()

      await user.type(
        screen.getByRole('textbox', { name: /email/i }),
        'wrong@example.com'
      )
      await user.type(
        screen.getByLabelText(/password/i),
        'badpassword'
      )
      await user.click(
        screen.getByRole('button', { name: /log in/i })
      )

      expect(mockAuthenticate).toHaveBeenCalledTimes(1)
      expect(mockAddError).toHaveBeenCalledWith(
        'Invalid credentials.'
      )
      expect(mockAddSuccess).not.toHaveBeenCalled()
    })

    it('displays the throttle message when login is rate limited', async () => {
      const user = userEvent.setup()
      mockAuthenticate.mockResolvedValue({
        ok: false,
        message:
          'Too many attempts — please wait a moment and try again.'
      })
      renderComponent()

      await user.type(
        screen.getByRole('textbox', { name: /email/i }),
        'wrong@example.com'
      )
      await user.type(
        screen.getByLabelText(/password/i),
        'badpassword'
      )
      await user.click(
        screen.getByRole('button', { name: /log in/i })
      )

      expect(mockAddError).toHaveBeenCalledWith(
        'Too many attempts — please wait a moment and try again.'
      )
      expect(mockAddSuccess).not.toHaveBeenCalled()
    })
  })

  describe('unexpected errors', () => {
    it('rethrows unknown errors', async () => {
      const user = userEvent.setup()
      mockAuthenticate.mockRejectedValue(new Error('Network error'))

      renderComponent()

      await user.type(
        screen.getByRole('textbox', { name: /email/i }),
        'test@example.com'
      )
      await user.type(
        screen.getByLabelText(/password/i),
        'supersecret'
      )
      await user.click(
        screen.getByRole('button', { name: /log in/i })
      )

      expect(mockAddError).toHaveBeenCalledWith('Network error')
      expect(mockAddSuccess).not.toHaveBeenCalled()
    })
  })
})
