import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {
  flagSuspiciousSubscriptions,
  setEmailSubscriptionSpam
} from '@/lib/email-subscriptions/actions'
import { FlagSuspiciousButton } from '@/ui/email-subscriptions/flag-suspicious-button'
import { SpamToggle } from '@/ui/email-subscriptions/spam-toggle'
import { useToast } from '@/ui/toast/toast-context'

const mockRefresh = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ refresh: mockRefresh }))
}))

jest.mock('@/lib/email-subscriptions/actions', () => ({
  flagSuspiciousSubscriptions: jest.fn(),
  setEmailSubscriptionSpam: jest.fn()
}))

jest.mock('@/ui/toast/toast-context', () => ({ useToast: jest.fn() }))
const mockAddError = jest.fn()
;(useToast as jest.Mock).mockReturnValue({
  addSuccessMessage: jest.fn(),
  addErrorMessage: mockAddError
})

describe('rejected subscriber actions', () => {
  beforeEach(() => jest.clearAllMocks())

  it('reports a rejected flag request and refreshes', async () => {
    jest
      .mocked(flagSuspiciousSubscriptions)
      .mockRejectedValueOnce(new Error('network'))
    render(<FlagSuspiciousButton />)

    await userEvent.click(
      screen.getByRole('button', { name: 'Flag suspicious' })
    )

    expect(mockAddError).toHaveBeenCalledWith(
      'Failed to flag subscribers.'
    )
    expect(mockRefresh).toHaveBeenCalled()
    expect(
      screen.getByRole('button', { name: 'Flag suspicious' })
    ).toBeEnabled()
  })

  it('refreshes after a flag error, for batches that saved', async () => {
    jest.mocked(flagSuspiciousSubscriptions).mockResolvedValueOnce({
      ok: false,
      message: 'Failed to flag subscribers: down.'
    })
    render(<FlagSuspiciousButton />)

    await userEvent.click(
      screen.getByRole('button', { name: 'Flag suspicious' })
    )

    expect(mockAddError).toHaveBeenCalledWith(
      'Failed to flag subscribers: down.'
    )
    expect(mockRefresh).toHaveBeenCalled()
  })

  it('reports a rejected spam toggle and refreshes', async () => {
    jest
      .mocked(setEmailSubscriptionSpam)
      .mockRejectedValueOnce(new Error('network'))
    render(
      <SpamToggle
        id='1'
        email='a@b.co'
        isSpam={false}
        fallbackFocusId='new'
      />
    )

    await userEvent.click(
      screen.getByRole('button', { name: 'Mark as spam: a@b.co' })
    )

    expect(mockAddError).toHaveBeenCalledWith(
      'Failed to update subscriber.'
    )
    expect(mockRefresh).toHaveBeenCalled()
    // the row stays put, so focus does too
    expect(
      screen.getByRole('button', { name: 'Mark as spam: a@b.co' })
    ).toBeEnabled()
  })
})
