import { fireEvent, render, screen } from '@testing-library/react'

import { DeleteItemButton } from '@/ui/items/delete-item-button'
import { ToastProvider } from '@/ui/toast/toast-context'

const pushMock = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock })
}))

function renderComponent(deleteItem: jest.Mock) {
  return render(
    <ToastProvider>
      <DeleteItemButton
        deleteItem={deleteItem}
        itemLabel='project'
        redirectTo='/projects'
      />
    </ToastProvider>
  )
}

describe('DeleteItemButton', () => {
  beforeEach(() => jest.clearAllMocks())

  it('does not call deleteItem until the confirm dialog is opened and confirmed', () => {
    const deleteItem = jest.fn()
    renderComponent(deleteItem)

    expect(deleteItem).not.toHaveBeenCalled()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('opens a confirm dialog when Delete is clicked', () => {
    renderComponent(jest.fn())

    fireEvent.click(
      screen.getByRole('button', { name: /^delete project$/i })
    )

    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('closes the dialog without deleting when cancelled', () => {
    const deleteItem = jest.fn()
    renderComponent(deleteItem)

    fireEvent.click(
      screen.getByRole('button', { name: /^delete project$/i })
    )
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(deleteItem).not.toHaveBeenCalled()
  })

  it('calls deleteItem and redirects on confirm', async () => {
    const deleteItem = jest.fn().mockResolvedValue({ ok: true })
    renderComponent(deleteItem)

    fireEvent.click(
      screen.getByRole('button', { name: /^delete project$/i })
    )
    fireEvent.click(
      screen.getByRole('button', { name: /confirm delete/i })
    )

    expect(deleteItem).toHaveBeenCalledTimes(1)
    expect(await screen.findByRole('status')).toHaveTextContent(
      'project deleted.'
    )
    expect(pushMock).toHaveBeenCalledWith('/projects')
  })

  it('shows an error toast and does not redirect on failure', async () => {
    const deleteItem = jest.fn().mockResolvedValue({
      ok: false,
      message: 'Failed to delete project: DB error.'
    })
    renderComponent(deleteItem)

    fireEvent.click(
      screen.getByRole('button', { name: /^delete project$/i })
    )
    fireEvent.click(
      screen.getByRole('button', { name: /confirm delete/i })
    )

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Failed to delete project: DB error.'
    )
    expect(pushMock).not.toHaveBeenCalled()
  })
})
