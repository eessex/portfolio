import {
  act,
  fireEvent,
  render,
  screen,
  waitFor
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ToastProvider, useToast } from '@/ui/toast/toast-context'

function ToastTestHarness() {
  const { addSuccessMessage, addErrorMessage, removeMessage } =
    useToast()

  return (
    <div>
      <button onClick={() => addSuccessMessage('Success message')}>
        Add success
      </button>

      <button onClick={() => addErrorMessage('Error message')}>
        Add error
      </button>

      <button
        onClick={() => {
          const id = addSuccessMessage('Removable message')
          removeMessage(id)
        }}
      >
        Remove
      </button>
    </div>
  )
}

function renderWithToastProvider(ui: React.ReactNode) {
  return render(<ToastProvider>{ui}</ToastProvider>)
}

describe('ToastProvider and useToast', () => {
  describe('useToast hook', () => {
    it('throws an error when used outside of ToastProvider', () => {
      function OutsideProvider() {
        useToast()
        return null
      }

      expect(() => render(<OutsideProvider />)).toThrow(
        'useToast must be used within ToastProvider'
      )
    })

    it('returns toast actions when used within ToastProvider', () => {
      renderWithToastProvider(<ToastTestHarness />)

      expect(screen.getByText('Add success')).toBeInTheDocument()
      expect(screen.getByText('Add error')).toBeInTheDocument()
      expect(screen.getByText('Remove')).toBeInTheDocument()
    })
  })

  describe('adding toasts', () => {
    it('adds a success toast with the correct message', async () => {
      renderWithToastProvider(<ToastTestHarness />)

      await userEvent.click(screen.getByText('Add success'))

      expect(screen.getByText('Success message')).toBeInTheDocument()
    })

    it('adds an error toast with the correct message', async () => {
      renderWithToastProvider(<ToastTestHarness />)

      await userEvent.click(screen.getByText('Add error'))

      expect(screen.getByText('Error message')).toBeInTheDocument()
    })

    it('returns a unique id when adding a success toast', async () => {
      function IdTestHarness() {
        const { addSuccessMessage } = useToast()

        return (
          <div>
            <button
              onClick={() => {
                const id1 = addSuccessMessage('One')
                const id2 = addSuccessMessage('Two')

                const el = document.getElementById('ids')
                if (el) el.textContent = `${id1},${id2}`
              }}
            >
              Add two
            </button>
            <div id='ids' />
          </div>
        )
      }

      renderWithToastProvider(<IdTestHarness />)

      await userEvent.click(screen.getByText('Add two'))

      const idsText = screen.getByText(/\d+,\d+/).textContent
      const [id1, id2] = idsText!.split(',').map(Number)

      expect(id2).toBeGreaterThan(id1)
    })
  })

  describe('removing toasts', () => {
    it('removes a toast when removeMessage is called', async () => {
      renderWithToastProvider(<ToastTestHarness />)

      await userEvent.click(screen.getByText('Remove'))

      await waitFor(() => {
        expect(
          screen.queryByText('Removable message')
        ).not.toBeInTheDocument()
      })
    })

    it('automatically removes a toast after the timeout', async () => {
      jest.useFakeTimers()

      renderWithToastProvider(<ToastTestHarness />)

      fireEvent.click(screen.getByText('Add success'))

      expect(screen.getByText('Success message')).toBeInTheDocument()

      act(() => {
        jest.runAllTimers()
      })

      expect(
        screen.queryByText('Success message')
      ).not.toBeInTheDocument()

      jest.useRealTimers()
    })
  })

  describe('rendering behavior', () => {
    it('renders Toast components inside the toast container', async () => {
      renderWithToastProvider(<ToastTestHarness />)

      await userEvent.click(screen.getByText('Add success'))

      const container = document.querySelector('.toast-container')
      expect(container).toBeInTheDocument()
      expect(container).toContainElement(
        screen.getByText('Success message')
      )
    })

    it('renders multiple toasts when multiple messages are added', async () => {
      renderWithToastProvider(<ToastTestHarness />)

      await userEvent.click(screen.getByText('Add success'))
      await userEvent.click(screen.getByText('Add error'))

      expect(screen.getByText('Success message')).toBeInTheDocument()
      expect(screen.getByText('Error message')).toBeInTheDocument()
    })
  })
})
