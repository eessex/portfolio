import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { flagSuspiciousSubscriptions } from '@/lib/email-subscriptions/actions'
import { SubscriberActions } from '@/ui/email-subscriptions/subscriber-actions'

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ refresh: jest.fn() }))
}))
jest.mock('@/lib/email-subscriptions/actions', () => ({
  flagSuspiciousSubscriptions: jest.fn(),
  exportEmailSubscriptions: jest.fn()
}))
jest.mock('@/ui/toast/toast-context', () => ({
  useToast: jest.fn(() => ({
    addSuccessMessage: jest.fn(),
    addErrorMessage: jest.fn()
  }))
}))

describe('SubscriberActions', () => {
  it('offers Flag suspicious once everyone is exported', () => {
    // a rules change can still flag exported rows
    render(<SubscriberActions activeCount={3} unexportedCount={0} />)
    expect(
      screen.getByRole('button', { name: 'Flag suspicious' })
    ).toBeInTheDocument()
  })

  it('hides Flag suspicious with no active subscribers', () => {
    render(<SubscriberActions activeCount={0} unexportedCount={0} />)
    expect(
      screen.queryByRole('button', { name: 'Flag suspicious' })
    ).not.toBeInTheDocument()
  })

  it('leaves focus alone when nothing was hidden', () => {
    render(<SubscriberActions activeCount={0} unexportedCount={0} />)
    expect(document.body).toHaveFocus()
  })

  it('focuses the New heading once flagging hides it', async () => {
    jest
      .mocked(flagSuspiciousSubscriptions)
      .mockResolvedValueOnce({ ok: true, message: 'Flagged 1.' })
    const heading = (
      <h2 id='new-subscribers-heading' tabIndex={-1}>
        New
      </h2>
    )
    const { rerender } = render(
      <>
        <SubscriberActions activeCount={1} unexportedCount={1} />
        {heading}
      </>
    )

    await userEvent.click(
      screen.getByRole('button', { name: 'Flag suspicious' })
    )
    // the only active subscriber is now spam, so Export all is
    // disabled too
    rerender(
      <>
        <SubscriberActions activeCount={0} unexportedCount={0} />
        {heading}
      </>
    )

    expect(screen.getByRole('heading', { name: 'New' })).toHaveFocus()
  })
})
