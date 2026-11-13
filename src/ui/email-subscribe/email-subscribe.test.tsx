import {
  act,
  fireEvent,
  render,
  screen,
  waitFor
} from '@testing-library/react'
import fetchMock from 'jest-fetch-mock'
import Cookies from 'js-cookie'

import {
  ELAPSED_FIELD,
  MIN_ELAPSED_MS
} from '@/lib/email-subscriptions/form-fields'
import { EmailSubscribe } from '@/ui/email-subscribe/email-subscribe'

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
  beforeEach(() => fetchMock.resetMocks())

  afterEach(() => {
    Cookies.remove('is_subscribed')
    jest.useRealTimers()
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
    jest.useFakeTimers()
    fetchMock.mockResponseOnce(
      JSON.stringify({
        ok: true,
        message: 'Successfully subscribed!'
      })
    )
    render(
      <>
        <EmailSubscribe label='Mailing list' />
        <EmailSubscribe label='Mailing list' />
      </>
    )

    const [input] = screen.getAllByLabelText('Email address')
    fireEvent.change(input!, { target: { value: 'a@example.com' } })
    fireEvent.submit(input!.closest('form')!)
    await act(() => jest.advanceTimersByTimeAsync(MIN_ELAPSED_MS))

    await waitFor(() =>
      expect(
        screen.queryAllByLabelText('Email address')
      ).toHaveLength(0)
    )
  })

  it('waits out the bot timing check, then posts how long the form was open', async () => {
    jest.useFakeTimers()
    fetchMock.mockResponseOnce(JSON.stringify({ ok: true }))
    render(<EmailSubscribe label='Mailing list' />)

    const input = screen.getByLabelText('Email address')
    fireEvent.change(input, { target: { value: 'a@example.com' } })
    fireEvent.submit(input.closest('form')!)

    await act(() => jest.advanceTimersByTimeAsync(MIN_ELAPSED_MS - 1))
    expect(fetchMock).not.toHaveBeenCalled()
    await act(() => jest.advanceTimersByTimeAsync(1))

    await waitFor(() => expect(fetchMock).toHaveBeenCalled())
    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe('/api/subscribe')
    const body = init?.body as FormData
    expect(body.get('email')).toBe('a@example.com')
    expect(Number(body.get(ELAPSED_FIELD))).toBeGreaterThanOrEqual(
      MIN_ELAPSED_MS
    )
  })
})
