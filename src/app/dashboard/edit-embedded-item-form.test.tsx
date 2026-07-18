import {
  fireEvent,
  render,
  screen,
  waitFor
} from '@testing-library/react'

import { EditEmbeddedItemForm } from '@/app/dashboard/edit-embedded-item-form'
import { EmbeddedItemTypes } from '@/lib/schemas'
import { venueFixtureAlpha } from '@/lib/venues/fixtures'
import { ToastProvider } from '@/ui/toast/toast-context'

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() })
}))

jest.mock('@/lib/db', () => ({
  sql: jest.fn()
}))

jest.mock('@/lib/images/data', () => ({
  checkIfImageExists: jest.fn()
}))

function renderComponent(editItem: jest.Mock) {
  return render(
    <ToastProvider>
      <EditEmbeddedItemForm
        item={venueFixtureAlpha}
        itemType={EmbeddedItemTypes.venues}
        editItem={editItem}
      />
    </ToastProvider>
  )
}

describe('EditEmbeddedItemForm', () => {
  it('displays a validation error below the relevant field on failure', async () => {
    const editItem = jest.fn().mockResolvedValue({
      ok: false,
      errors: { name: ['Name is required'] },
      message: 'Failed to validate venue.'
    })
    renderComponent(editItem)

    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: 'Changed' }
    })
    fireEvent.click(screen.getByRole('button', { name: /save/i }))

    expect(
      await screen.findByText(/name is required/i)
    ).toBeInTheDocument()
  })

  it('does not show a redundant toast when a field error is displayed', async () => {
    const editItem = jest.fn().mockResolvedValue({
      ok: false,
      errors: { name: ['Name is required'] },
      message: 'Failed to validate venue.'
    })
    renderComponent(editItem)

    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: 'Changed' }
    })
    fireEvent.click(screen.getByRole('button', { name: /save/i }))

    await screen.findByText(/name is required/i)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('shows a toast when a failure has no field errors', async () => {
    const editItem = jest.fn().mockResolvedValue({
      ok: false,
      message: 'Failed to edit venue: connection refused.'
    })
    renderComponent(editItem)

    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: 'Changed' }
    })
    fireEvent.click(screen.getByRole('button', { name: /save/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Failed to edit venue: connection refused.'
    )
  })

  it('clears the error once the form is resubmitted successfully', async () => {
    const editItem = jest
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        errors: { name: ['Name is required'] },
        message: 'Failed to validate venue.'
      })
      .mockResolvedValueOnce({ ok: true, res: venueFixtureAlpha })
    renderComponent(editItem)

    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: 'Changed' }
    })
    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    await screen.findByText(/name is required/i)

    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: 'Changed again' }
    })
    fireEvent.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() =>
      expect(
        screen.queryByText(/name is required/i)
      ).not.toBeInTheDocument()
    )
  })
})
