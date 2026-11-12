import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { setEmailSubscriptionSpam } from '@/lib/email-subscriptions/actions'
import { SpamToggle } from '@/ui/email-subscriptions/spam-toggle'

const mockRefresh = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ refresh: mockRefresh }))
}))

jest.mock('@/lib/email-subscriptions/actions', () => ({
  setEmailSubscriptionSpam: jest.fn()
}))
const mockSetSpam = jest.mocked(setEmailSubscriptionSpam)

jest.mock('@/ui/toast/toast-context', () => ({
  useToast: jest.fn(() => ({ addErrorMessage: jest.fn() }))
}))

function rows(emails: string[]) {
  return (
    <>
      <h2 id='fallback' tabIndex={-1}>
        New
      </h2>
      <table>
        <tbody>
          {emails.map((email) => (
            <tr key={email}>
              <td>
                <SpamToggle
                  id={email}
                  email={email}
                  isSpam={false}
                  fallbackFocusId='fallback'
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}

const toggleButton = (email: string) =>
  screen.getByRole('button', { name: `Mark as spam: ${email}` })

describe('SpamToggle', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSetSpam.mockResolvedValue({ ok: true })
  })

  it('moves focus to the next row once its own row moves', async () => {
    const { rerender } = render(rows(['a@x.com', 'b@x.com']))

    await userEvent.click(toggleButton('a@x.com'))
    expect(mockSetSpam).toHaveBeenCalledWith('a@x.com', true)
    expect(mockRefresh).toHaveBeenCalled()
    // the refresh: the row is now in another table
    rerender(rows(['b@x.com']))

    expect(toggleButton('b@x.com')).toHaveFocus()
  })

  it('falls back to the previous row', async () => {
    const { rerender } = render(rows(['a@x.com', 'b@x.com']))
    await userEvent.click(toggleButton('b@x.com'))
    rerender(rows(['a@x.com']))
    expect(toggleButton('a@x.com')).toHaveFocus()
  })

  it('focuses the fallback when it was the only row', async () => {
    const { rerender } = render(rows(['a@x.com']))
    await userEvent.click(toggleButton('a@x.com'))
    rerender(rows([]))
    expect(screen.getByRole('heading', { name: 'New' })).toHaveFocus()
  })

  it('moves focus after a lost response that saved', async () => {
    mockSetSpam.mockRejectedValueOnce(new Error('network'))
    const { rerender } = render(rows(['a@x.com', 'b@x.com']))

    await userEvent.click(toggleButton('a@x.com'))
    expect(mockRefresh).toHaveBeenCalled()
    rerender(rows(['b@x.com']))

    expect(toggleButton('b@x.com')).toHaveFocus()
  })

  it('keeps focus on the row when a lost response didn’t save', async () => {
    mockSetSpam.mockRejectedValueOnce(new Error('network'))
    const { rerender } = render(rows(['a@x.com', 'b@x.com']))

    await userEvent.click(toggleButton('a@x.com'))
    rerender(rows(['a@x.com', 'b@x.com']))

    expect(toggleButton('a@x.com')).toHaveFocus()
  })

  it('leaves focus where the user moved it while saving', async () => {
    let finish: (res: { ok: true }) => void = () => {}
    mockSetSpam.mockReturnValueOnce(
      new Promise((resolve) => {
        finish = resolve
      })
    )
    const { rerender } = render(rows(['a@x.com', 'b@x.com']))

    await userEvent.click(toggleButton('a@x.com'))
    const heading = screen.getByRole('heading', { name: 'New' })
    heading.focus()
    await act(async () => finish({ ok: true }))
    rerender(rows(['b@x.com']))

    expect(heading).toHaveFocus()
  })

  it('refreshes after an error and moves focus if the row moved', async () => {
    // a lost DB response comes back as an error, though it may
    // have saved
    mockSetSpam.mockResolvedValueOnce({
      ok: false,
      message: 'Failed to update subscriber: down.'
    })
    const { rerender } = render(rows(['a@x.com', 'b@x.com']))

    await userEvent.click(toggleButton('a@x.com'))
    expect(mockRefresh).toHaveBeenCalled()
    // the refresh shows it saved after all
    rerender(rows(['b@x.com']))

    expect(toggleButton('b@x.com')).toHaveFocus()
  })

  it('leaves focus alone after an error once the user moved on', async () => {
    mockSetSpam.mockResolvedValueOnce({ ok: false, message: 'No.' })
    const { rerender } = render(rows(['a@x.com', 'b@x.com']))

    await userEvent.click(toggleButton('a@x.com'))
    const heading = screen.getByRole('heading', { name: 'New' })
    heading.focus()
    // e.g. another page of the table
    rerender(rows(['b@x.com']))

    expect(heading).toHaveFocus()
  })

  it('skips a neighbour still saving its own toggle', async () => {
    let finishB: (res: { ok: true }) => void = () => {}
    mockSetSpam
      .mockReturnValueOnce(
        new Promise((resolve) => {
          finishB = resolve
        })
      )
      .mockResolvedValueOnce({ ok: true })
    const { rerender } = render(rows(['a@x.com', 'b@x.com']))

    // b is still saving, so its button is disabled
    await userEvent.click(toggleButton('b@x.com'))
    await userEvent.click(toggleButton('a@x.com'))
    rerender(rows(['b@x.com']))

    expect(screen.getByRole('heading', { name: 'New' })).toHaveFocus()
    await act(async () => finishB({ ok: true }))
  })
})
