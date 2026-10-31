import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/navigation'

import { mockFile } from '@/test/helpers'
import { Form } from '@/ui/form/form'
import { ToastProvider } from '@/ui/toast/toast-context'

const pushMock = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() }))
}))
const mockUseRouter = jest.mocked(useRouter)

function renderForm(
  action: jest.Mock,
  {
    isUnsavedChangesConfirmed
  }: { isUnsavedChangesConfirmed?: boolean } = {}
) {
  return render(
    <ToastProvider>
      {/* mimics a NextLink: always prevents default navigation itself */}
      <a href='/dashboard' onClick={(e) => e.preventDefault()}>
        Dashboard
      </a>
      <Form
        action={action}
        isUnsavedChangesConfirmed={isUnsavedChangesConfirmed}
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

  describe('submit', () => {
    it('skips the action and says so when nothing changed', async () => {
      const action = jest.fn()
      renderForm(action)

      fireEvent.click(screen.getByRole('button', { name: /save/i }))

      await screen.findByText('No changes to save.')
      expect(action).not.toHaveBeenCalled()
      expect(
        screen.queryByText('Changes saved.')
      ).not.toBeInTheDocument()
    })

    it('saves and confirms when something changed', async () => {
      const action = jest.fn().mockResolvedValue({ ok: true })
      renderForm(action)

      fireEvent.change(screen.getByLabelText(/title/i), {
        target: { value: 'Changed' }
      })
      fireEvent.click(screen.getByRole('button', { name: /save/i }))

      await screen.findByText('Changes saved.')
      expect(action).toHaveBeenCalledTimes(1)
    })

    it('saves when only a namespaced file input changed', async () => {
      const action = jest.fn().mockResolvedValue({ ok: true })
      render(
        <ToastProvider>
          <Form action={action}>
            <label htmlFor='icon'>Icon</label>
            <input id='icon' type='file' name='iconImage.file' />
          </Form>
        </ToastProvider>
      )

      await userEvent.upload(
        screen.getByLabelText('Icon'),
        mockFile('icon.png', 2048, 'image/png')
      )
      fireEvent.click(screen.getByRole('button', { name: /save/i }))

      await screen.findByText('Changes saved.')
      expect(action).toHaveBeenCalledTimes(1)
    })

    it('saves when a repeated field changes anywhere but its last value', async () => {
      const action = jest.fn().mockResolvedValue({ ok: true })
      render(
        <ToastProvider>
          <Form action={action}>
            <label htmlFor='first'>First</label>
            <input id='first' name='linkIds' defaultValue='a' />
            <input name='linkIds' defaultValue='b' />
          </Form>
        </ToastProvider>
      )

      fireEvent.change(screen.getByLabelText('First'), {
        target: { value: 'c' }
      })
      fireEvent.click(screen.getByRole('button', { name: /save/i }))

      await screen.findByText('Changes saved.')
      expect(action).toHaveBeenCalledTimes(1)
    })
  })

  describe('failed submit', () => {
    it('preserves the typed input when the action fails', async () => {
      const action = jest
        .fn()
        .mockResolvedValue({ ok: false, message: 'S3 upload failed' })
      renderForm(action)

      fireEvent.change(screen.getByLabelText(/title/i), {
        target: { value: 'Changed' }
      })
      fireEvent.click(screen.getByRole('button', { name: /save/i }))

      await screen.findByText(/s3 upload failed/i)
      expect(action).toHaveBeenCalledTimes(1)
      expect(screen.getByLabelText(/title/i)).toHaveValue('Changed')
    })
  })

  describe('redirecting action', () => {
    it('treats a server action redirect as success', async () => {
      const action = jest.fn().mockRejectedValue(
        Object.assign(new Error('NEXT_REDIRECT'), {
          digest: 'NEXT_REDIRECT;push;/;307;'
        })
      )
      renderForm(action)

      fireEvent.change(screen.getByLabelText(/title/i), {
        target: { value: 'Changed' }
      })
      fireEvent.click(screen.getByRole('button', { name: /save/i }))

      await screen.findByText(/redirecting/i)
      expect(
        screen.queryByText('NEXT_REDIRECT')
      ).not.toBeInTheDocument()
    })
  })

  describe('submit button', () => {
    it('defaults to the large primary button', () => {
      renderForm(jest.fn())

      expect(
        screen.getByRole('button', { name: /save/i })
      ).toHaveClass('button-lg', 'button-primary')
    })
  })

  describe('isUnsavedChangesConfirmed={false}', () => {
    it('does not show a confirm dialog when navigating away dirty', async () => {
      renderForm(jest.fn(), { isUnsavedChangesConfirmed: false })

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

    it('does not guard when isUnsavedChangesConfirmed is false', () => {
      renderForm(jest.fn(), { isUnsavedChangesConfirmed: false })

      fireEvent.change(screen.getByLabelText(/title/i), {
        target: { value: 'Changed' }
      })

      expect(dispatchBeforeUnload().defaultPrevented).toBe(false)
    })
  })
})
