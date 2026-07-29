import {
  fireEvent,
  render,
  screen,
  waitFor
} from '@testing-library/react'

import { editProject } from '@/lib/projects/actions'
import { projectFixtureBand } from '@/lib/projects/fixtures'
import { EditProjectForm } from '@/ui/projects/edit-project-form'
import { ToastProvider } from '@/ui/toast/toast-context'

const pushMock = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock })
}))

jest.mock('@/lib/projects/actions', () => ({
  editProject: jest.fn(),
  deleteProject: jest.fn()
}))
const mockEditProject = jest.mocked(editProject)

function renderComponent(props = {}) {
  return render(
    <ToastProvider>
      <EditProjectForm {...props} />
    </ToastProvider>
  )
}

describe('EditProjectForm', () => {
  beforeEach(() => jest.clearAllMocks())

  describe('initial render', () => {
    it('renders title, description, short description, type, dates, published, and cover image fields', () => {
      renderComponent()

      expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
      expect(
        screen.getByLabelText(/short description/i)
      ).toBeInTheDocument()
      expect(
        screen.getByLabelText(/^description\b/i)
      ).toBeInTheDocument()
      expect(screen.getByLabelText(/type/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/start date/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/end date/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/published/i)).toBeInTheDocument()
      expect(
        screen.getByLabelText(/cover image/i)
      ).toBeInTheDocument()
    })
  })

  describe('default values', () => {
    it('sets defaultValue for each input from the project prop', () => {
      renderComponent({ project: projectFixtureBand })

      expect(screen.getByLabelText(/title/i)).toHaveValue('Band 1')
      expect(screen.getByLabelText(/short description/i)).toHaveValue(
        'A test band for SEO metadata.'
      )
      expect(screen.getByLabelText(/start date/i)).toHaveValue(
        '2025-01-01'
      )
    })

    it('handles no project (create mode) without errors', () => {
      renderComponent()

      expect(screen.getByLabelText(/title/i)).toHaveValue('')
      expect(screen.getByLabelText(/published/i)).not.toBeChecked()
    })
  })

  describe('error display', () => {
    it('handles errors passed via editProject validation failure', async () => {
      mockEditProject.mockResolvedValue({
        ok: false,
        errors: { title: ['Title is required'] },
        message: 'Failed to validate project.'
      })
      renderComponent()

      fireEvent.change(screen.getByLabelText(/title/i), {
        target: { value: 'Changed' }
      })
      fireEvent.change(screen.getByLabelText(/type/i), {
        target: { value: 'band' }
      })
      fireEvent.change(screen.getByLabelText(/start date/i), {
        target: { value: '2025-01-01' }
      })
      fireEvent.change(screen.getByLabelText(/^description\b/i), {
        target: { value: 'A test description.' }
      })
      fireEvent.click(screen.getByRole('button', { name: /save/i }))

      expect(
        await screen.findByText(/title is required/i)
      ).toBeInTheDocument()
    })
  })

  describe('submit', () => {
    it('redirects to the project page on successful save', async () => {
      mockEditProject.mockResolvedValue({
        ok: true,
        res: projectFixtureBand
      })
      renderComponent({ project: projectFixtureBand })

      fireEvent.change(screen.getByLabelText(/title/i), {
        target: { value: 'Changed title' }
      })
      fireEvent.change(screen.getByLabelText(/^description\b/i), {
        target: { value: 'A test description.' }
      })
      fireEvent.click(screen.getByRole('button', { name: /save/i }))

      await waitFor(() =>
        expect(pushMock).toHaveBeenCalledWith(
          `/projects/${projectFixtureBand.slug}`
        )
      )
    })

    it('does not redirect when the save fails', async () => {
      mockEditProject.mockResolvedValue({
        ok: false,
        message: 'Failed to save project: connection refused.'
      })
      renderComponent({ project: projectFixtureBand })

      fireEvent.change(screen.getByLabelText(/title/i), {
        target: { value: 'Changed title' }
      })
      fireEvent.change(screen.getByLabelText(/^description\b/i), {
        target: { value: 'A test description.' }
      })
      fireEvent.click(screen.getByRole('button', { name: /save/i }))

      expect(await screen.findByRole('alert')).toHaveTextContent(
        'Failed to save project: connection refused.'
      )
      expect(pushMock).not.toHaveBeenCalled()
    })
  })
})
