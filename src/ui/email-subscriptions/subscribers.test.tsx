import { render, screen, within } from '@testing-library/react'

import type {
  EmailSubscription,
  EmailSubscriptionsPage
} from '@/lib/email-subscriptions/types'
import { Subscribers } from '@/ui/email-subscriptions/subscribers'

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ refresh: jest.fn() }))
}))
jest.mock('@/lib/email-subscriptions/actions', () => ({}))
jest.mock('@/ui/toast/toast-context', () => ({
  useToast: jest.fn(() => ({
    addSuccessMessage: jest.fn(),
    addErrorMessage: jest.fn()
  }))
}))

const subscriber: EmailSubscription = {
  id: '6a1f8c58-7d0c-4d8a-9c55-0d0e5b6f3a11',
  email: 'a@example.com',
  isSpam: false,
  isSpamReviewed: false,
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-01T00:00:00Z')
}

const empty: EmailSubscriptionsPage = {
  items: [],
  page: 1,
  pageCount: 1,
  activeCount: 0,
  unexportedCount: 0,
  exportedItems: [],
  exportedPage: 1,
  exportedPageCount: 1,
  exportedCount: 0,
  spamItems: [],
  spamPage: 1,
  spamPageCount: 1,
  spamCount: 0
}

function table(heading: string) {
  const section = screen
    .getByRole('heading', { name: heading })
    .closest('section')!
  return within(section)
}

describe('Subscribers', () => {
  it('splits new, exported and spam subscribers', () => {
    render(
      <Subscribers
        data={{
          ...empty,
          items: [{ ...subscriber, email: 'new@example.com' }],
          activeCount: 2,
          unexportedCount: 1,
          exportedItems: [
            {
              ...subscriber,
              email: 'old@example.com',
              exportedAt: new Date('2026-11-01T12:00:00Z')
            }
          ],
          exportedCount: 1,
          spamItems: [
            { ...subscriber, email: 'spam@example.com', isSpam: true }
          ],
          spamCount: 1
        }}
      />
    )

    const newTable = table('New (1)')
    expect(newTable.getByText('new@example.com')).toBeInTheDocument()
    expect(
      newTable.queryByRole('columnheader', { name: 'Last exported' })
    ).not.toBeInTheDocument()

    const exported = table('Exported (1)')
    expect(exported.getByText('old@example.com')).toBeInTheDocument()
    expect(
      exported.getByRole('columnheader', { name: 'Last exported' })
    ).toBeInTheDocument()

    const spam = table('Spam (1)')
    expect(spam.getByText('spam@example.com')).toBeInTheDocument()
    expect(
      spam.getByRole('columnheader', { name: 'Reason' })
    ).toBeInTheDocument()
  })

  it('hides empty exported and spam tables', () => {
    render(<Subscribers data={empty} />)
    expect(
      screen.getByText('No one has subscribed yet.')
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: /Exported|Spam/ })
    ).not.toBeInTheDocument()
  })

  it('says when everyone has been exported', () => {
    render(
      <Subscribers
        data={{
          ...empty,
          activeCount: 1,
          exportedItems: [subscriber],
          exportedCount: 1
        }}
      />
    )
    expect(
      screen.getByText('Everyone has been exported.')
    ).toBeInTheDocument()
  })
})
