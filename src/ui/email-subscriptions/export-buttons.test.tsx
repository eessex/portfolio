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
const mockAddError = jest.fn()
;(useToast as jest.Mock).mockReturnValue({
  addSuccessMessage: mockAddSuccess,
  addErrorMessage: mockAddError
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

  it('shows counts and hides Export new with nothing new', () => {
    render(<ExportButtons exportableCount={3} unexportedCount={0} />)
    expect(
      screen.getByRole('button', { name: 'Export all (3)' })
    ).toBeEnabled()
    expect(
      screen.queryByRole('button', { name: /Export new/ })
    ).not.toBeInTheDocument()
  })

  it('disables Export all with no one to export', () => {
    render(<ExportButtons exportableCount={0} unexportedCount={0} />)
    expect(
      screen.getByRole('button', { name: 'Export all (0)' })
    ).toBeDisabled()
  })

  it('hides Export new when it matches Export all', () => {
    render(<ExportButtons exportableCount={3} unexportedCount={3} />)
    expect(
      screen.getByRole('button', { name: 'Export all (3)' })
    ).toBeEnabled()
    expect(
      screen.queryByRole('button', { name: /Export new/ })
    ).not.toBeInTheDocument()
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

  it('moves focus to Export all once Export new is hidden', async () => {
    mockExport.mockResolvedValueOnce({ ok: true, res: file })
    const { rerender } = render(
      <ExportButtons exportableCount={3} unexportedCount={2} />
    )

    await userEvent.click(
      screen.getByRole('button', { name: 'Export new (2)' })
    )
    // the refreshed counts
    rerender(
      <ExportButtons exportableCount={3} unexportedCount={0} />
    )

    expect(
      screen.getByRole('button', { name: 'Export all (3)' })
    ).toHaveFocus()
  })

  it('points a lost response to Export all', async () => {
    mockExport.mockRejectedValueOnce(new Error('network'))
    render(<ExportButtons exportableCount={3} unexportedCount={2} />)

    await userEvent.click(
      screen.getByRole('button', { name: 'Export new (2)' })
    )

    expect(mockAddError).toHaveBeenCalledWith(
      expect.stringContaining(
        'If it went through, use Export all to download everyone again.'
      )
    )
    // so the new export shows up in the list
    expect(mockRefresh).toHaveBeenCalled()
    expect(
      screen.getByRole('button', { name: 'Export new (2)' })
    ).toBeEnabled()
  })

  it('points a failed save to Export all', async () => {
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

    expect(mockAddError).toHaveBeenCalledWith(
      'Couldn’t save the file. Use Export all to download everyone again.'
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

    expect(mockAddError).toHaveBeenCalledWith(
      'Failed to export subscribers: down. If it went through, use Export all to download everyone again.'
    )
    // it may have stamped rows before the response was lost
    expect(mockRefresh).toHaveBeenCalled()
  })

  it('leaves focus alone once the user has moved on', async () => {
    mockExport.mockResolvedValueOnce({ ok: false, message: 'No.' })
    const { rerender } = render(
      <>
        <ExportButtons exportableCount={3} unexportedCount={2} />
        <button type='button'>Mark as spam</button>
      </>
    )

    await userEvent.click(
      screen.getByRole('button', { name: 'Export new (2)' })
    )
    // marking spam later hides Export new, and its row unmounts
    screen.getByRole('button', { name: 'Mark as spam' }).focus()
    rerender(
      <ExportButtons exportableCount={1} unexportedCount={0} />
    )

    expect(
      screen.getByRole('button', { name: 'Export all (1)' })
    ).not.toHaveFocus()
  })

  it('moves focus after an error that still stamped rows', async () => {
    // a lost DB response comes back as an error
    mockExport.mockResolvedValueOnce({ ok: false, message: 'Down.' })
    const { rerender } = render(
      <ExportButtons exportableCount={3} unexportedCount={2} />
    )

    await userEvent.click(
      screen.getByRole('button', { name: 'Export new (2)' })
    )
    // the refresh shows the rows were exported after all
    rerender(
      <ExportButtons exportableCount={3} unexportedCount={0} />
    )

    expect(
      screen.getByRole('button', { name: 'Export all (3)' })
    ).toHaveFocus()
  })
})
