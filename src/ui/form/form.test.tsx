import { fireEvent, render, screen } from '@testing-library/react'
import { useRouter } from 'next/navigation'

import { Form } from '@/ui/form/form'
import { ToastProvider } from '@/ui/toast/toast-context'

const pushMock = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() }))
}))
const mockUseRouter = jest.mocked(useRouter)

function renderForm(
  action: jest.Mock,
  { confirmUnsavedChanges }: { confirmUnsavedChanges?: boolean } = {}
) {
  return render(
    <ToastProvider>
      {/* mimics a NextLink: always prevents default navigation itself */}
      <a href='/dashboard' onClick={(e) => e.preventDefault()}>
        Dashboard
      </a>
      <Form
        action={action}
        confirmUnsavedChanges={confirmUnsavedChanges}
      >
        <label htmlFor='title'>Title</label>
        <input id='title' name='title' defaultValue='Original' />
      </Form>
    </ToastProvider>
  )
}

describe('Form', () => {
  beforeEach(() => {
    pushMock.mockClear()
    mockUseRouter.mockReturnValue({
      push: pushMock
    } as unknown as ReturnType<typeof useRouter>)
  })

  describe('in-app navigation guard', () => {
    it('navigates immediately when the form is unchanged', async () => {
      renderForm(jest.fn())

      fireEvent.click(
        screen.getByRole('link', { name: /dashboard/i })
      )

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('shows a confirm dialog when leaving with unsaved changes', async () => {
      renderForm(jest.fn())

      fireEvent.change(screen.getByLabelText(/title/i), {
        target: { value: 'Changed' }
      })
      fireEvent.click(
        screen.getByRole('link', { name: /dashboard/i })
      )

      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(pushMock).not.toHaveBeenCalled()
    })

    it('stays on the page and keeps the changes when cancelled', async () => {
      renderForm(jest.fn())

      fireEvent.change(screen.getByLabelText(/title/i), {
        target: { value: 'Changed' }
      })
      fireEvent.click(
        screen.getByRole('link', { name: /dashboard/i })
      )
      fireEvent.click(
        screen.getByRole('button', { name: /stay on this page/i })
      )

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      expect(pushMock).not.toHaveBeenCalled()
      expect(screen.getByLabelText(/title/i)).toHaveValue('Changed')
    })

    it('navigates to the pending link when confirmed', async () => {
      renderForm(jest.fn())

      fireEvent.change(screen.getByLabelText(/title/i), {
        target: { value: 'Changed' }
      })
      fireEvent.click(
        screen.getByRole('link', { name: /dashboard/i })
      )
      fireEvent.click(
        screen.getByRole('button', { name: /leave without saving/i })
      )

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      expect(pushMock).toHaveBeenCalledWith(
        expect.stringContaining('/dashboard')
      )
    })
  })

  describe('confirmUnsavedChanges={false}', () => {
    it('does not show a confirm dialog when navigating away dirty', async () => {
      renderForm(jest.fn(), { confirmUnsavedChanges: false })

      fireEvent.change(screen.getByLabelText(/title/i), {
        target: { value: 'Changed' }
      })
      fireEvent.click(
        screen.getByRole('link', { name: /dashboard/i })
      )

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  describe('beforeunload guard', () => {
    function dispatchBeforeUnload() {
      const event = new Event('beforeunload', { cancelable: true })
      window.dispatchEvent(event)
      return event
    }

    it('prevents unload when dirty', () => {
      renderForm(jest.fn())

      fireEvent.change(screen.getByLabelText(/title/i), {
        target: { value: 'Changed' }
      })

      expect(dispatchBeforeUnload().defaultPrevented).toBe(true)
    })

    it('does not prevent unload when unchanged', () => {
      renderForm(jest.fn())

      expect(dispatchBeforeUnload().defaultPrevented).toBe(false)
    })

    it('does not guard when confirmUnsavedChanges is false', () => {
      renderForm(jest.fn(), { confirmUnsavedChanges: false })

      fireEvent.change(screen.getByLabelText(/title/i), {
        target: { value: 'Changed' }
      })

      expect(dispatchBeforeUnload().defaultPrevented).toBe(false)
    })
  })
})
