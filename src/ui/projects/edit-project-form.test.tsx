import {
  fireEvent,
  render,
  screen,
  waitFor
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { imageFixture } from '@/lib/images/fixtures'
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

jest.mock('@/lib/db', () => ({ sql: jest.fn() }))

const titleText = 'Title'
const typeText = 'Type'
const startDateRegex = /start date/i
const endDateRegex = /end date/i
const descriptionRegex = /^description\b/i
const publishedRegex = /published/i
const saveButtonText = 'Save'

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
    it('renders title, description, type, dates, published, and images fields', () => {
      renderComponent()

      expect(screen.getByLabelText(titleText)).toBeInTheDocument()
      expect(
        screen.getByLabelText(descriptionRegex)
      ).toBeInTheDocument()
      expect(screen.getByLabelText(typeText)).toBeInTheDocument()
      expect(
        screen.getByLabelText(startDateRegex)
      ).toBeInTheDocument()
      expect(screen.getByLabelText(endDateRegex)).toBeInTheDocument()
      expect(
        screen.getByLabelText(publishedRegex)
      ).toBeInTheDocument()
      expect(screen.getByText(/^images/i)).toBeInTheDocument()
    })
  })

  describe('images field', () => {
    it('seeds with the cover image first, then the gallery images in order', () => {
      renderComponent({
        project: {
          ...projectFixtureBand,
          coverImage: {
            ...imageFixture,
            id: 'cover-image',
            title: 'Cover'
          },
          images: [
            { ...imageFixture, id: 'image-1', title: 'First image' },
            { ...imageFixture, id: 'image-2', title: 'Second image' }
          ]
        }
      })

      expect(screen.getByText('Cover')).toBeInTheDocument()
      expect(screen.getByText('First image')).toBeInTheDocument()
      expect(screen.getByText('Second image')).toBeInTheDocument()
      expect(screen.getByDisplayValue('cover-image')).toHaveAttribute(
        'name',
        'images[1].id'
      )
      expect(screen.getByDisplayValue('image-1')).toHaveAttribute(
        'name',
        'images[2].id'
      )
      expect(screen.getByDisplayValue('image-2')).toHaveAttribute(
        'name',
        'images[3].id'
      )
    })

    it('renders the create-new image fields inline without submitting', () => {
      renderComponent()

      expect(
        screen.getByLabelText(/upload new image/i)
      ).toBeInTheDocument()
      expect(mockEditProject).not.toHaveBeenCalled()
    })
  })

  describe('default values', () => {
    it('sets defaultValue for each input from the project prop', () => {
      renderComponent({ project: projectFixtureBand })

      expect(screen.getByLabelText(titleText)).toHaveValue('Band 1')
      // expect(screen.getByLabelText(/short description/i)).toHaveValue(
      //   'A test band for SEO metadata.'
      // )
      expect(screen.getByLabelText(startDateRegex)).toHaveValue(
        '2025-01-01'
      )
    })

    it('handles no project (create mode) without errors', () => {
      renderComponent()

      expect(screen.getByLabelText(titleText)).toHaveValue('')
      expect(screen.getByLabelText(publishedRegex)).not.toBeChecked()
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
    it('handles errors passed via editProject validation failure', async () => {
      mockEditProject.mockResolvedValue({
        ok: false,
        errors: { title: ['Title is required'] },
        message: 'Failed to validate project.'
      })
      renderComponent()

      fireEvent.change(screen.getByLabelText(titleText), {
        target: { value: 'Changed' }
      })
      fireEvent.change(screen.getByLabelText(typeText), {
        target: { value: 'band' }
      })
      fireEvent.change(screen.getByLabelText(startDateRegex), {
        target: { value: '2025-01-01' }
      })
      fireEvent.change(screen.getByLabelText(descriptionRegex), {
        target: { value: 'A test description.' }
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
    it('redirects to the project page on successful save', async () => {
      mockEditProject.mockResolvedValue({
        ok: true,
        res: projectFixtureBand
      })
      renderComponent({ project: projectFixtureBand })

      fireEvent.change(screen.getByLabelText(titleText), {
        target: { value: 'Changed title' }
      })
      fireEvent.change(screen.getByLabelText(descriptionRegex), {
        target: { value: 'A test description.' }
      })
      fireEvent.click(
        screen.getByRole('button', { name: saveButtonText })
      )

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

      fireEvent.change(screen.getByLabelText(titleText), {
        target: { value: 'Changed title' }
      })
      fireEvent.change(screen.getByLabelText(descriptionRegex), {
        target: { value: 'A test description.' }
      })
      fireEvent.click(
        screen.getByRole('button', { name: saveButtonText })
      )

      expect(await screen.findByRole('alert')).toHaveTextContent(
        'Failed to save project: connection refused.'
      )
      expect(pushMock).not.toHaveBeenCalled()
    })
  })
})
