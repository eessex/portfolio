import {
  fireEvent,
  render,
  screen,
  waitFor
} from '@testing-library/react'
import Cookies from 'js-cookie'

import { createEmailSubscription } from '@/lib/email-subscriptions/actions'
import { EmailSubscribe } from '@/ui/email-subscribe/email-subscribe'

jest.mock('@/lib/email-subscriptions/actions', () => ({
  createEmailSubscription: jest.fn()
}))
jest.mock('@/ui/toast/toast-context', () => ({
  useToast: () => ({
    addErrorMessage: jest.fn(),
    addSuccessMessage: jest.fn()
  })
}))
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() })
}))

describe('EmailSubscribe', () => {
  afterEach(() => {
    Cookies.remove('is_subscribed')
  })

  it('names a group around the form with a visible label', () => {
    render(<EmailSubscribe label='Mailing list' />)

    expect(
      screen.getByRole('group', { name: 'Mailing list' })
    ).toContainElement(screen.getByLabelText('Email address'))
    expect(screen.getByText('Mailing list')).toBeVisible()
  })

  it('describes the form', () => {
    render(<EmailSubscribe label='Mailing list' />)

    expect(
      screen.getByLabelText('Email address').closest('form')
    ).toHaveAccessibleDescription('Subscribe to irregular updates')
  })

  it('keeps a visually hidden label in the group name', () => {
    render(
      <EmailSubscribe
        label='Mailing list'
        labelClassName='visually-hidden'
      />
    )

    expect(
      screen.getByRole('group', { name: 'Mailing list' })
    ).toBeInTheDocument()
    expect(screen.getByText('Mailing list')).toHaveClass(
      'visually-hidden'
    )
  })

  it('gives each copy its own input ids', () => {
    render(
      <>
        <EmailSubscribe label='Mailing list' />
        <EmailSubscribe label='Mailing list' />
      </>
    )

    const inputs = screen.getAllByLabelText('Email address')
    expect(inputs).toHaveLength(2)
    expect(inputs[0]?.id).not.toBe(inputs[1]?.id)
  })

  it('hides every copy once one subscribes', async () => {
    jest.mocked(createEmailSubscription).mockResolvedValue({
      ok: true,
      message: 'Successfully subscribed!'
    })
    render(
      <>
        <EmailSubscribe label='Mailing list' />
        <EmailSubscribe label='Mailing list' />
      </>
    )

    const [input] = screen.getAllByLabelText('Email address')
    fireEvent.change(input!, { target: { value: 'a@example.com' } })
    fireEvent.submit(input!.closest('form')!)

    await waitFor(() =>
      expect(
        screen.queryAllByLabelText('Email address')
      ).toHaveLength(0)
    )
  })
})
