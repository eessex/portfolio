import {
  fireEvent,
  render,
  screen,
  waitFor
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { previewEmbedCodeMetadata } from '@/lib/embed-codes/preview-metadata'
import { projectFixtureBand } from '@/lib/projects/fixtures'
import { publishedEditionFixtureAlpha } from '@/lib/published-editions/fixtures'
import { publisherFixtureAlpha } from '@/lib/publishers/fixtures'
import { deleteRelease, editRelease } from '@/lib/releases/actions'
import { releaseFixtureAlbum } from '@/lib/releases/fixtures'
import { EditReleaseForm } from '@/ui/releases/edit-release-form'
import { ToastProvider } from '@/ui/toast/toast-context'

const pushMock = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock })
}))

jest.mock('@/lib/releases/actions', () => ({
  editRelease: jest.fn(),
  deleteRelease: jest.fn()
}))
const mockEditRelease = jest.mocked(editRelease)

jest.mock('@/lib/embed-codes/preview-metadata', () => ({
  previewEmbedCodeMetadata: jest.fn()
}))
const mockPreviewMetadata = jest.mocked(previewEmbedCodeMetadata)

jest.mock('@/lib/db', () => ({ sql: jest.fn() }))

const titleText = 'Title'
const artistRegex = /artist name/i
const editionsText = 'Published editions'
const descriptionRegex = /^description\b/i
const publishedRegex = /published/i
const saveButtonText = 'Save'

// the images picker's create form has its own Type select
function typeSelect() {
  return document.querySelector<HTMLSelectElement>(
    'select[name="type"]'
  )
}

// every saved release has a project and at least one edition
const releaseWithEdition = {
  ...releaseFixtureAlbum,
  project: projectFixtureBand,
  publishedEditions: [
    {
      ...publishedEditionFixtureAlpha,
      publisher: publisherFixtureAlpha
    }
  ]
}

function renderComponent(props = {}) {
  return render(
    <ToastProvider>
      <EditReleaseForm {...props} />
    </ToastProvider>
  )
}

describe('EditReleaseForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockPreviewMetadata.mockResolvedValue({})
  })

  describe('initial render', () => {
    it('renders title, artist, type, editions, description, published, and pickers', () => {
      renderComponent()

      expect(screen.getByLabelText(titleText)).toBeInTheDocument()
      expect(screen.getByLabelText(artistRegex)).toBeInTheDocument()
      expect(typeSelect()).toBeInTheDocument()
      expect(screen.getByText(editionsText)).toBeInTheDocument()
      expect(
        screen.getByLabelText(descriptionRegex)
      ).toBeInTheDocument()
      expect(
        screen.getByLabelText(publishedRegex)
      ).toBeInTheDocument()
      expect(screen.getByText(/^images/i)).toBeInTheDocument()
      expect(screen.getByText(/^project/i)).toBeInTheDocument()
    })

    it('has no release date input: editions set it', () => {
      renderComponent()

      expect(
        document.querySelector('input[name="releaseDate"]')
      ).not.toBeInTheDocument()
    })

    it('marks title, artist and type required', () => {
      renderComponent()

      expect(screen.getByLabelText(titleText)).toBeRequired()
      expect(screen.getByLabelText(artistRegex)).toBeRequired()
      expect(typeSelect()).toBeRequired()
      expect(
        screen.getByLabelText(descriptionRegex)
      ).not.toBeRequired()
    })
  })

  describe('default values', () => {
    it('sets defaultValue for each input from the release prop', () => {
      renderComponent({ release: releaseFixtureAlbum })

      expect(screen.getByLabelText(titleText)).toHaveValue(
        releaseFixtureAlbum.title
      )
      expect(screen.getByLabelText(artistRegex)).toHaveValue(
        releaseFixtureAlbum.artist
      )
      expect(typeSelect()).toHaveValue(releaseFixtureAlbum.type)
      expect(screen.getByLabelText(publishedRegex)).toBeChecked()
    })

    it('handles no release (create mode) without errors', () => {
      renderComponent()

      expect(screen.getByLabelText(titleText)).toHaveValue('')
      expect(typeSelect()).toHaveValue('')
      expect(screen.getByLabelText(publishedRegex)).not.toBeChecked()
    })
  })

  describe('artist field', () => {
    it('comes after the project it defaults to', () => {
      renderComponent()

      const project = screen.getByText('Project')
      const artist = screen.getByLabelText(artistRegex)
      expect(
        project.compareDocumentPosition(artist) &
          Node.DOCUMENT_POSITION_FOLLOWING
      ).toBeTruthy()
    })

    const releaseWithoutArtist = {
      ...releaseWithEdition,
      artist: undefined
    }

    it("fills in the project's name when blank", () => {
      renderComponent({ release: releaseWithoutArtist })

      expect(screen.getByLabelText(artistRegex)).toHaveValue(
        projectFixtureBand.title
      )
    })

    it('shows the saved artist as its value', () => {
      renderComponent({
        release: {
          ...releaseWithEdition,
          artist: 'Joe Smith & Friends'
        }
      })

      expect(screen.getByLabelText(artistRegex)).toHaveValue(
        'Joe Smith & Friends'
      )
    })

    it('follows the project picker while auto-filled', async () => {
      renderComponent({ release: releaseWithoutArtist })

      fireEvent.click(
        screen.getByRole('button', { name: /remove project/i })
      )

      await waitFor(() =>
        expect(screen.getByLabelText(artistRegex)).toHaveValue('')
      )
    })

    it('keeps a typed name when the project changes', async () => {
      renderComponent({ release: releaseWithoutArtist })
      const artist = screen.getByLabelText(artistRegex)
      fireEvent.change(artist, {
        target: { value: 'Joe Smith & Friends' }
      })

      fireEvent.click(
        screen.getByRole('button', { name: /remove project/i })
      )

      await waitFor(() =>
        expect(
          screen.queryByText(projectFixtureBand.title)
        ).not.toBeInTheDocument()
      )
      expect(artist).toHaveValue('Joe Smith & Friends')
    })
  })

  describe('project field', () => {
    function projectIdValue(container: HTMLElement) {
      return container
        .querySelector<HTMLInputElement>('input[name="projectId"]')
        ?.getAttribute('value')
    }

    it('starts with no project for a new release', () => {
      const { container } = renderComponent()

      expect(projectIdValue(container)).toBeFalsy()
    })

    it('starts with no project for a release with none', () => {
      const { container } = renderComponent({
        release: { ...releaseFixtureAlbum, project: undefined }
      })

      expect(projectIdValue(container)).toBeFalsy()
    })

    it("shows the release's own project", () => {
      const { container } = renderComponent({
        release: {
          ...releaseFixtureAlbum,
          project: projectFixtureBand
        }
      })

      expect(
        screen.getByText(projectFixtureBand.title)
      ).toBeInTheDocument()
      expect(projectIdValue(container)).toBe(projectFixtureBand.id)
    })

    it("won't save once the project is removed", async () => {
      renderComponent({ release: releaseWithEdition })

      fireEvent.click(
        screen.getByRole('button', { name: /remove project/i })
      )
      fireEvent.change(screen.getByLabelText(artistRegex), {
        target: { value: 'Joe Smith & Friends' }
      })
      fireEvent.click(
        screen.getByRole('button', { name: saveButtonText })
      )

      const search = screen.getByRole('combobox', {
        name: /project/i
      })
      expect(search).toBeInvalid()
      expect((search as HTMLInputElement).validationMessage).toBe(
        'Select a project.'
      )
      expect(mockEditRelease).not.toHaveBeenCalled()
    })

    it('marks the project picker required', () => {
      renderComponent()

      expect(screen.getByText('Project').textContent).not.toMatch(
        /optional/
      )
    })

    it('shows a missing project error', async () => {
      mockEditRelease.mockResolvedValue({
        ok: false,
        message: 'Failed to validate release.',
        errors: { projectId: ['Select a project.'] }
      })
      renderComponent({ release: releaseWithEdition })

      fireEvent.click(
        screen.getByRole('button', { name: /remove project/i })
      )
      fireEvent.change(screen.getByLabelText(artistRegex), {
        target: { value: 'Joe Smith & Friends' }
      })
      // past the browser's own required check, e.g. a stale client
      fireEvent.submit(
        screen
          .getByRole('button', { name: saveButtonText })
          .closest('form')!
      )

      expect(
        await screen.findByText('Select a project.')
      ).toHaveAttribute('role', 'alert')
    })
  })

  describe('published editions field', () => {
    it('opens a blank edition editor for a new release', () => {
      renderComponent()

      expect(
        document.querySelector(
          'select[name="publishedEditions[0].format"]'
        )
      ).toBeInTheDocument()
      expect(
        document.querySelector(
          'input[name="publishedEditions[0].publishDate"]'
        )
      ).toBeRequired()
    })

    it("shows a release's editions as chips, without an open editor", () => {
      renderComponent({ release: releaseWithEdition })

      expect(
        screen.getByText(
          `LP · ${publisherFixtureAlpha.name} · Jan 2020`
        )
      ).toBeInTheDocument()
      expect(
        document.querySelector(
          'input[name="publishedEditions[0].id"]'
        )
      ).toHaveValue(publishedEditionFixtureAlpha.id)
      expect(
        document.querySelector('select[name$=".format"]')
      ).not.toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /new published edition/i })
      ).toBeInTheDocument()
    })

    it('lists editions by date, with no drag controls', () => {
      const later = {
        ...releaseWithEdition.publishedEditions[0],
        id: '88888888-8888-4888-8888-888888888888',
        format: 'Cassette' as const,
        publishDate: new Date('2021-06-01')
      }
      renderComponent({
        release: {
          ...releaseWithEdition,
          publishedEditions: [
            later,
            ...releaseWithEdition.publishedEditions
          ]
        }
      })

      expect(
        document.querySelector(
          'input[name="publishedEditions[0].id"]'
        )
      ).toHaveValue(publishedEditionFixtureAlpha.id)
      expect(
        document.querySelector(
          'input[name="publishedEditions[1].id"]'
        )
      ).toHaveValue(later.id)
      expect(
        screen.queryByRole('button', { name: 'Drag to reorder' })
      ).not.toBeInTheDocument()
    })

    it('opens an edition for editing, prefixed under its entry', () => {
      renderComponent({ release: releaseWithEdition })

      fireEvent.click(screen.getByRole('button', { name: 'Edit' }))

      expect(
        document.querySelector<HTMLSelectElement>(
          'select[name="publishedEditions[0].format"]'
        )
      ).toHaveValue('LP')
      expect(
        document.querySelector(
          'input[name="publishedEditions[0].publisherId"]'
        )
      ).toHaveValue(publisherFixtureAlpha.id)
    })

    it('shows the editions error from the server', async () => {
      mockEditRelease.mockResolvedValue({
        ok: false,
        errors: {
          publishedEditions: ['Add at least one published edition.']
        },
        message: 'Failed to validate release.'
      })
      renderComponent({ release: releaseWithEdition })

      fireEvent.click(
        screen.getByRole('button', { name: saveButtonText })
      )

      expect(
        await screen.findByText('Add at least one published edition.')
      ).toBeInTheDocument()
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
    })
  })

  describe('error display', () => {
    it('shows field errors from an editRelease validation failure', async () => {
      mockEditRelease.mockResolvedValue({
        ok: false,
        errors: { title: ['Title is required'] },
        message: 'Failed to validate release.'
      })
      renderComponent({ release: releaseWithEdition })

      fireEvent.click(
        screen.getByRole('button', { name: saveButtonText })
      )

      expect(
        await screen.findByText(/title is required/i)
      ).toBeInTheDocument()
    })
  })

  describe('submit', () => {
    it('redirects to the release page on successful save', async () => {
      mockEditRelease.mockResolvedValue({
        ok: true,
        res: releaseFixtureAlbum
      })
      renderComponent({ release: releaseWithEdition })

      fireEvent.change(screen.getByLabelText(titleText), {
        target: { value: 'Changed title' }
      })
      fireEvent.click(
        screen.getByRole('button', { name: saveButtonText })
      )

      await waitFor(() =>
        expect(pushMock).toHaveBeenCalledWith(
          `/releases/${releaseFixtureAlbum.slug}`
        )
      )
      expect(mockEditRelease).toHaveBeenCalledWith(
        expect.any(FormData),
        releaseFixtureAlbum.id
      )
    })

    it('does not redirect when the save fails', async () => {
      mockEditRelease.mockResolvedValue({
        ok: false,
        message: 'Failed to save release: connection refused.'
      })
      renderComponent({ release: releaseWithEdition })

      fireEvent.click(
        screen.getByRole('button', { name: saveButtonText })
      )

      expect(await screen.findByRole('alert')).toHaveTextContent(
        'Failed to save release: connection refused.'
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
          <EditReleaseForm release={releaseFixtureAlbum} />
        </ToastProvider>
      )
      expect(
        screen.getByRole('button', { name: /delete/i })
      ).toBeInTheDocument()
      expect(deleteRelease).not.toHaveBeenCalled()
    })
  })
})
