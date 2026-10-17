import {
  fireEvent,
  render,
  screen,
  waitFor
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { previewEmbedCodeMetadata } from '@/lib/embed-codes/preview-metadata'
import { deleteEvent, editEvent } from '@/lib/events/actions'
import { eventFixtureUpcoming } from '@/lib/events/fixtures'
import { projectFixtureBand } from '@/lib/projects/fixtures'
import { venueFixtureAlpha } from '@/lib/venues/fixtures'
import { EditEventForm } from '@/ui/events/edit-event-form'
import { ToastProvider } from '@/ui/toast/toast-context'
import { toDateTimeInputValue } from '@/ui/util'

const pushMock = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock })
}))

jest.mock('@/lib/events/actions', () => ({
  editEvent: jest.fn(),
  deleteEvent: jest.fn()
}))
const mockEditEvent = jest.mocked(editEvent)

jest.mock('@/lib/embed-codes/preview-metadata', () => ({
  previewEmbedCodeMetadata: jest.fn()
}))
const mockPreviewMetadata = jest.mocked(previewEmbedCodeMetadata)

jest.mock('@/lib/db', () => ({ sql: jest.fn() }))

const titleText = 'Title'
const startTimeRegex = /start time/i
const endTimeRegex = /end time/i
const descriptionRegex = /^description\b/i
const ticketRegex = /ticket link/i
const publishedRegex = /published/i
const saveButtonText = 'Save'

function renderComponent(props = {}) {
  return render(
    <ToastProvider>
      <EditEventForm {...props} />
    </ToastProvider>
  )
}

describe('EditEventForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockPreviewMetadata.mockResolvedValue({})
  })

  describe('initial render', () => {
    it('renders title, start/end time, ticket link, description, venue, published, and pickers', () => {
      renderComponent()

      expect(screen.getByLabelText(titleText)).toBeInTheDocument()
      expect(
        screen.getByLabelText(startTimeRegex)
      ).toBeInTheDocument()
      expect(screen.getByLabelText(endTimeRegex)).toBeInTheDocument()
      expect(screen.getByLabelText(ticketRegex)).toBeInTheDocument()
      expect(
        screen.getByLabelText(descriptionRegex)
      ).toBeInTheDocument()
      expect(
        screen.getByLabelText(publishedRegex)
      ).toBeInTheDocument()
      expect(screen.getByText(/^venue/i)).toBeInTheDocument()
      expect(screen.getByText(/^images/i)).toBeInTheDocument()
      expect(screen.getByText(/^project/i)).toBeInTheDocument()
    })
  })

  describe('default values', () => {
    it('sets defaultValue for each input from the event prop', () => {
      renderComponent({ event: eventFixtureUpcoming })

      expect(screen.getByLabelText(titleText)).toHaveValue(
        eventFixtureUpcoming.title
      )
      expect(screen.getByLabelText(startTimeRegex)).toHaveValue(
        toDateTimeInputValue(
          eventFixtureUpcoming.startTime,
          eventFixtureUpcoming.venue?.timezone
        )
      )
    })

    it('handles no event (create mode) without errors', () => {
      renderComponent()

      expect(screen.getByLabelText(titleText)).toHaveValue('')
      expect(screen.getByLabelText(publishedRegex)).not.toBeChecked()
    })

    it('shows the currently attached venue when provided', () => {
      renderComponent({ event: eventFixtureUpcoming })

      expect(
        screen.getByText(new RegExp(venueFixtureAlpha.name!))
      ).toBeInTheDocument()
    })
  })

  describe('venue field', () => {
    it('marks the venue picker required and the project picker optional', () => {
      renderComponent()

      expect(screen.getByText('Venue').textContent).not.toMatch(
        /optional/
      )
      expect(screen.getByText('Project').textContent).toMatch(
        /optional/
      )
    })

    it('opens the inline venue create form on New venue', () => {
      renderComponent()

      fireEvent.click(
        screen.getByRole('button', { name: /new venue/i })
      )

      expect(screen.getByLabelText(/city/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/timezone/i)).toBeInTheDocument()
      expect(mockEditEvent).not.toHaveBeenCalled()
    })

    it('namespaces the inline venue fields under venue.', () => {
      renderComponent()

      fireEvent.click(
        screen.getByRole('button', { name: /new venue/i })
      )

      expect(screen.getByLabelText(/^city$/i)).toHaveAttribute(
        'name',
        'venue.city'
      )
      expect(screen.getByLabelText(/timezone/i)).toHaveAttribute(
        'name',
        'venue.timezone'
      )
    })

    it('collapses a new venue into a chip', async () => {
      renderComponent()

      fireEvent.click(
        screen.getByRole('button', { name: /new venue/i })
      )
      fireEvent.change(screen.getByLabelText(/^city$/i), {
        target: { value: venueFixtureAlpha.city }
      })
      fireEvent.change(screen.getByLabelText(/timezone/i), {
        target: { value: venueFixtureAlpha.timezone }
      })
      fireEvent.click(
        screen.getByRole('button', { name: /save venue/i })
      )

      await waitFor(() => {
        expect(screen.getByLabelText(/^city$/i)).not.toBeVisible()
      })
      expect(
        screen.getByText(new RegExp(venueFixtureAlpha.city))
      ).toBeVisible()
    })

    it('opens the attached venue for inline editing, seeded with its fields', () => {
      renderComponent({ event: eventFixtureUpcoming })

      fireEvent.click(screen.getByRole('button', { name: /edit/i }))

      expect(screen.getByLabelText(/city/i)).toHaveValue(
        venueFixtureAlpha.city
      )
    })
  })

  describe('project field', () => {
    function projectIdValue(container: HTMLElement) {
      return container
        .querySelector<HTMLInputElement>('input[name="projectId"]')
        ?.getAttribute('value')
    }

    it('starts with no project for a new event', () => {
      const { container } = renderComponent()

      expect(projectIdValue(container)).toBeFalsy()
    })

    it('starts with no project for a event with none', () => {
      const { container } = renderComponent({
        event: { ...eventFixtureUpcoming, project: undefined }
      })

      expect(projectIdValue(container)).toBeFalsy()
    })

    it("shows the event's own project", () => {
      const { container } = renderComponent({
        event: {
          ...eventFixtureUpcoming,
          project: projectFixtureBand
        }
      })

      expect(
        screen.getByText(projectFixtureBand.title)
      ).toBeInTheDocument()
      expect(projectIdValue(container)).toBe(projectFixtureBand.id)
    })
  })

  describe('published field', () => {
    it('toggles when clicked', async () => {
      const user = userEvent.setup()
      renderComponent()

      const publishedCheckbox = screen.getByLabelText(publishedRegex)
      expect(publishedCheckbox).not.toBeChecked()

      await user.click(publishedCheckbox)
      expect(publishedCheckbox).toBeChecked()

      await user.click(publishedCheckbox)
      expect(publishedCheckbox).not.toBeChecked()
    })
  })

  describe('error display', () => {
    it('handles errors passed via editEvent validation failure', async () => {
      mockEditEvent.mockResolvedValue({
        ok: false,
        errors: { title: ['Title is required'] },
        message: 'Failed to validate event.'
      })
      renderComponent({ event: eventFixtureUpcoming })

      fireEvent.change(screen.getByLabelText(titleText), {
        target: { value: 'Changed' }
      })
      fireEvent.click(
        screen.getByRole('button', { name: saveButtonText })
      )

      expect(
        await screen.findByText(/title is required/i)
      ).toBeInTheDocument()
    })
  })

  describe('submit', () => {
    it('redirects to the event page on successful save', async () => {
      mockEditEvent.mockResolvedValue({
        ok: true,
        res: eventFixtureUpcoming
      })
      renderComponent({ event: eventFixtureUpcoming })

      fireEvent.change(screen.getByLabelText(titleText), {
        target: { value: 'Changed title' }
      })
      fireEvent.click(
        screen.getByRole('button', { name: saveButtonText })
      )

      await waitFor(() =>
        expect(pushMock).toHaveBeenCalledWith(
          `/events/${eventFixtureUpcoming.slug}`
        )
      )
    })

    it('does not redirect when the save fails', async () => {
      mockEditEvent.mockResolvedValue({
        ok: false,
        message: 'Failed to save event: connection refused.'
      })
      renderComponent({ event: eventFixtureUpcoming })

      fireEvent.change(screen.getByLabelText(titleText), {
        target: { value: 'Changed title' }
      })
      fireEvent.click(
        screen.getByRole('button', { name: saveButtonText })
      )

      expect(await screen.findByRole('alert')).toHaveTextContent(
        'Failed to save event: connection refused.'
      )
      expect(pushMock).not.toHaveBeenCalled()
    })
  })

  describe('delete', () => {
    it('renders a delete button only when editing', () => {
      const { rerender } = renderComponent()
      expect(
        screen.queryByRole('button', { name: /delete/i })
      ).not.toBeInTheDocument()

      rerender(
        <ToastProvider>
          <EditEventForm event={eventFixtureUpcoming} />
        </ToastProvider>
      )
      expect(
        screen.getByRole('button', { name: /delete/i })
      ).toBeInTheDocument()
      expect(deleteEvent).not.toHaveBeenCalled()
    })
  })
})
