import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { regenerateRecoveryCodes } from '@/lib/users/actions'
import { useToast } from '@/ui/toast/toast-context'
import {
  RecoveryCodesForm,
  RecoveryCodesList
} from '@/ui/users/recovery-codes'

const mockRefresh = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    refresh: mockRefresh
  }))
}))

jest.mock('@/lib/users/actions', () => ({
  regenerateRecoveryCodes: jest.fn()
}))
const mockRegenerate = jest.mocked(regenerateRecoveryCodes)

jest.mock('@/ui/toast/toast-context', () => ({ useToast: jest.fn() }))
const mockAddSuccess = jest.fn()
;(useToast as jest.Mock).mockReturnValue({
  addErrorMessage: jest.fn(),
  addSuccessMessage: mockAddSuccess,
  removeMessage: jest.fn()
})

const codes = ['AAAAA-AAAAA', 'BBBBB-BBBBB']

describe('RecoveryCodesList', () => {
  beforeEach(() => jest.clearAllMocks())

  it('lists the codes and only continues once they’re marked saved', async () => {
    const onDone = jest.fn()
    const user = userEvent.setup()
    render(<RecoveryCodesList codes={codes} onDone={onDone} />)

    expect(
      screen.getAllByRole('listitem').map((li) => li.textContent)
    ).toEqual(codes)
    const continueButton = screen.getByRole('button', {
      name: 'Continue'
    })
    await user.click(continueButton)
    expect(onDone).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toHaveTextContent(
      /tick this box/i
    )
    expect(
      screen.getByLabelText(/saved these codes/i)
    ).toHaveAttribute('aria-invalid', 'true')

    await user.click(screen.getByLabelText(/saved these codes/i))
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    await user.click(continueButton)

    expect(onDone).toHaveBeenCalled()
  })

  it('moves focus to its heading on mount', () => {
    render(<RecoveryCodesList codes={codes} onDone={jest.fn()} />)

    expect(
      screen.getByRole('heading', {
        name: /save your recovery codes/i
      })
    ).toHaveFocus()
  })

  it('keeps list semantics despite the unstyled list', () => {
    render(<RecoveryCodesList codes={codes} onDone={jest.fn()} />)

    expect(screen.getByRole('list')).toHaveAttribute('role', 'list')
  })

  it('copies the codes one per line', async () => {
    const user = userEvent.setup()
    const writeText = jest
      .spyOn(navigator.clipboard, 'writeText')
      .mockResolvedValue()
    render(<RecoveryCodesList codes={codes} onDone={jest.fn()} />)

    await user.click(screen.getByRole('button', { name: 'Copy' }))

    expect(writeText).toHaveBeenCalledWith(codes.join('\n'))
    expect(mockAddSuccess).toHaveBeenCalledWith(
      'Recovery codes copied.'
    )
  })

  it('downloads from an attached link, revoking its URL afterward', () => {
    jest.useFakeTimers()
    URL.createObjectURL = jest.fn(() => 'blob:codes')
    URL.revokeObjectURL = jest.fn()
    const click = jest
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(function (this: HTMLAnchorElement) {
        expect(this.isConnected).toBe(true)
      })
    render(<RecoveryCodesList codes={codes} onDone={jest.fn()} />)

    try {
      fireEvent.click(
        screen.getByRole('button', { name: 'Download' })
      )

      expect(click).toHaveBeenCalled()
      expect(URL.revokeObjectURL).not.toHaveBeenCalled()
      jest.runAllTimers()
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:codes')
    } finally {
      click.mockRestore()
      jest.useRealTimers()
    }
  })
})

describe('RecoveryCodesForm', () => {
  beforeEach(() => jest.clearAllMocks())

  it('shows how many codes are left', () => {
    render(<RecoveryCodesForm unusedCount={5} />)

    expect(
      screen.getByText(/5 of 8 recovery codes left/)
    ).toBeInTheDocument()
  })

  it('says when none are left', () => {
    render(<RecoveryCodesForm unusedCount={0} />)

    expect(
      screen.getByText(/no recovery codes left/i)
    ).toBeInTheDocument()
  })

  it('shows the new set after generating, then refreshes the count', async () => {
    mockRegenerate.mockResolvedValue({
      ok: true,
      res: { recoveryCodes: codes }
    })
    const user = userEvent.setup()
    render(<RecoveryCodesForm unusedCount={2} />)

    await user.type(
      screen.getByLabelText(/current password/i),
      'current-password'
    )
    await user.click(
      screen.getByRole('button', { name: 'Generate new codes' })
    )

    expect(
      mockRegenerate.mock.calls[0]?.[0].get('currentPassword')
    ).toBe('current-password')
    expect(await screen.findByText(codes[0])).toBeInTheDocument()

    await user.click(screen.getByLabelText(/saved these codes/i))
    await user.click(screen.getByRole('button', { name: 'Continue' }))

    expect(mockRefresh).toHaveBeenCalled()
    expect(
      screen.getByRole('button', { name: 'Generate new codes' })
    ).toBeInTheDocument()
  })
})
