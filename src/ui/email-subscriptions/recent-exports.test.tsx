import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { downloadSubscribersExport } from '@/lib/email-subscriptions/actions'
import { RecentExports } from '@/ui/email-subscriptions/recent-exports'
import { useToast } from '@/ui/toast/toast-context'

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ refresh: jest.fn() }))
}))

jest.mock('@/lib/email-subscriptions/actions', () => ({
  downloadSubscribersExport: jest.fn()
}))
const mockDownload = jest.mocked(downloadSubscribersExport)

jest.mock('@/ui/toast/toast-context', () => ({ useToast: jest.fn() }))
const mockAddSuccess = jest.fn()
;(useToast as jest.Mock).mockReturnValue({
  addSuccessMessage: mockAddSuccess,
  addErrorMessage: jest.fn()
})

const NEW_ID = '00000000-0000-4000-8000-000000000001'
const ALL_ID = '00000000-0000-4000-8000-000000000002'

const exports = [
  {
    id: NEW_ID,
    scope: 'new' as const,
    subscriberCount: 3,
    createdAt: new Date('2026-11-02T12:00:00Z')
  },
  {
    id: ALL_ID,
    scope: 'all' as const,
    subscriberCount: 40,
    createdAt: new Date('2026-11-01T12:00:00Z')
  }
]

describe('RecentExports', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    URL.createObjectURL = jest.fn(() => 'blob:x')
    URL.revokeObjectURL = jest.fn()
    jest
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {})
  })

  it('renders nothing before the first export', () => {
    const { container } = render(<RecentExports exports={[]} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('offers Download again only for new exports', () => {
    render(<RecentExports exports={exports} />)
    const rows = screen.getAllByRole('row').slice(1)
    expect(rows[0]).toHaveTextContent('New')
    expect(rows[0]).toHaveTextContent('3')
    expect(rows[1]).toHaveTextContent('All')
    expect(rows[1]).toHaveTextContent('40')
    expect(
      screen.getAllByRole('button', { name: /^Download again/ })
    ).toHaveLength(1)
  })

  it('downloads a past export again', async () => {
    mockDownload.mockResolvedValueOnce({
      ok: true,
      res: { csv: 'email\r\n', filename: 'x.csv', count: 3 }
    })
    render(<RecentExports exports={exports} />)

    await userEvent.click(
      screen.getByRole('button', { name: /^Download again/ })
    )

    expect(mockDownload).toHaveBeenCalledWith(NEW_ID)
    expect(URL.createObjectURL).toHaveBeenCalled()
    expect(mockAddSuccess).toHaveBeenCalledWith(
      'Exported 3 subscribers.'
    )
  })

  it('shows a download error', async () => {
    mockDownload.mockResolvedValueOnce({
      ok: false,
      message: 'Export not found.'
    })
    render(<RecentExports exports={exports} />)

    await userEvent.click(
      screen.getByRole('button', { name: /^Download again/ })
    )

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Export not found.'
    )
  })
})
