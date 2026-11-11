import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { exportEmailSubscriptions } from '@/lib/email-subscriptions/actions'
import { ExportButtons } from '@/ui/email-subscriptions/export-buttons'
import { useToast } from '@/ui/toast/toast-context'

const mockRefresh = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ refresh: mockRefresh }))
}))

jest.mock('@/lib/email-subscriptions/actions', () => ({
  exportEmailSubscriptions: jest.fn()
}))
const mockExport = jest.mocked(exportEmailSubscriptions)

jest.mock('@/ui/toast/toast-context', () => ({ useToast: jest.fn() }))
const mockAddSuccess = jest.fn()
;(useToast as jest.Mock).mockReturnValue({
  addSuccessMessage: mockAddSuccess,
  addErrorMessage: jest.fn()
})

const file = {
  csv: 'email\r\n',
  filename: 'subscribers-new.csv',
  count: 2
}

describe('ExportButtons', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    URL.createObjectURL = jest.fn(() => 'blob:x')
    URL.revokeObjectURL = jest.fn()
    jest
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {})
  })

  it('shows counts and disables an empty export', () => {
    render(<ExportButtons exportableCount={3} unexportedCount={0} />)
    expect(
      screen.getByRole('button', { name: 'Export all (3)' })
    ).toBeEnabled()
    expect(
      screen.getByRole('button', { name: 'Export new (0)' })
    ).toBeDisabled()
  })

  it('saves the CSV and refreshes', async () => {
    mockExport.mockResolvedValueOnce({ ok: true, res: file })
    render(<ExportButtons exportableCount={3} unexportedCount={2} />)

    await userEvent.click(
      screen.getByRole('button', { name: 'Export new (2)' })
    )

    expect(mockExport).toHaveBeenCalledWith('new')
    expect(URL.createObjectURL).toHaveBeenCalled()
    // later, so the download isn't cancelled
    expect(URL.revokeObjectURL).not.toHaveBeenCalled()
    expect(mockAddSuccess).toHaveBeenCalledWith(
      'Exported 2 subscribers.'
    )
    expect(mockRefresh).toHaveBeenCalled()
  })

  it('points a lost response to Recent exports', async () => {
    mockExport.mockRejectedValueOnce(new Error('network'))
    render(<ExportButtons exportableCount={3} unexportedCount={2} />)

    await userEvent.click(
      screen.getByRole('button', { name: 'Export new (2)' })
    )

    expect(screen.getByRole('alert')).toHaveTextContent(
      'If it went through, download it from Recent exports.'
    )
    // so the new export shows up in the list
    expect(mockRefresh).toHaveBeenCalled()
    expect(
      screen.getByRole('button', { name: 'Export new (2)' })
    ).toBeEnabled()
  })

  it('points a failed save to Recent exports', async () => {
    mockExport.mockResolvedValueOnce({ ok: true, res: file })
    jest
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementationOnce(() => {
        throw new Error('blocked')
      })
    render(<ExportButtons exportableCount={3} unexportedCount={2} />)

    await userEvent.click(
      screen.getByRole('button', { name: 'Export new (2)' })
    )

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Couldn’t save the file. Download it from Recent exports.'
    )
    expect(mockAddSuccess).not.toHaveBeenCalled()
  })

  it('shows an action error', async () => {
    mockExport.mockResolvedValueOnce({
      ok: false,
      message: 'Failed to export subscribers: down.'
    })
    render(<ExportButtons exportableCount={3} unexportedCount={2} />)

    await userEvent.click(
      screen.getByRole('button', { name: 'Export all (3)' })
    )

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Failed to export subscribers: down.'
    )
  })
})
