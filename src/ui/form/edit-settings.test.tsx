import {
  fireEvent,
  render,
  screen,
  waitFor
} from '@testing-library/react'

import { imageFixture } from '@/lib/images/fixtures'
import { linkFixture } from '@/lib/links/fixtures'
import { editSiteSettings } from '@/lib/site-settings/actions'
import { mockFile } from '@/test/helpers'
import { EditSettings } from '@/ui/form/edit-settings'
import { ToastProvider } from '@/ui/toast/toast-context'

const pushMock = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock })
}))

jest.mock('@/lib/site-settings/actions', () => ({
  editSiteSettings: jest.fn()
}))
const mockEditSiteSettings = jest.mocked(editSiteSettings)

jest.mock('@/lib/db', () => ({ sql: jest.fn() }))

URL.createObjectURL = jest.fn(() => 'blob:mock-preview')
URL.revokeObjectURL = jest.fn()

class LoadingImage {
  onload: (() => void) | null = null
  onerror: (() => void) | null = null
  naturalWidth = 100
  naturalHeight = 40

  set src(_value: string) {
    queueMicrotask(() => this.onload?.())
  }
}

function renderComponent(props = {}) {
  return render(
    <ToastProvider>
      <EditSettings {...props} />
    </ToastProvider>
  )
}

describe('EditSettings', () => {
  const originalImage = global.Image
  beforeEach(() => jest.clearAllMocks())
  afterEach(() => {
    global.Image = originalImage
  })

  it('renders title, description, and cover image fields', () => {
    renderComponent()

    expect(screen.getByLabelText(/^site title/i)).toBeInTheDocument()
    expect(
      screen.getByLabelText(/site description/i)
    ).toBeInTheDocument()
    expect(screen.getByLabelText(/cover image/i)).toBeInTheDocument()
  })

  it('renders the create-new image fields inline without submitting', () => {
    renderComponent()

    // logo (beside the title), cover image, then site icon
    expect(
      screen
        .getAllByLabelText(/upload new image/i)
        .map((input) => input.getAttribute('name'))
    ).toEqual(['logoImage.file', 'coverImage.file', 'iconImage.file'])
    expect(mockEditSiteSettings).not.toHaveBeenCalled()
  })

  it('starts the site title from the About title on first run', () => {
    renderComponent({ defaultTitle: 'Jane Doe' })

    expect(screen.getByLabelText(/^site title/i)).toHaveValue(
      'Jane Doe'
    )
  })

  it('keeps a saved site title over the About title', () => {
    renderComponent({
      settings: { title: 'Saved title', description: 'A site.' },
      defaultTitle: 'Jane Doe'
    })

    expect(screen.getByLabelText(/^site title/i)).toHaveValue(
      'Saved title'
    )
  })

  it('renders an optional site icon picker', () => {
    renderComponent()

    expect(
      document.querySelector('input[name="iconImageId"]')
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        /A square image: an SVG, or at least 600 × 600/
      )
    ).toBeInTheDocument()
    expect(
      document.querySelector('input[name="iconImage.file"]')
    ).not.toBeRequired()
  })

  // the cover is the OG fallback, which link previews can't show as SVG
  it('takes SVG uploads for the icon and logo only', () => {
    renderComponent()

    const accept = (name: string) =>
      document
        .querySelector(`input[name="${name}.file"]`)
        ?.getAttribute('accept')
    expect(accept('iconImage')).toContain('image/svg+xml')
    expect(accept('logoImage')).toContain('image/svg+xml')
    expect(accept('coverImage')).not.toContain('image/svg+xml')
  })

  it('renders an optional logo picker, with no logo-only option yet', () => {
    renderComponent()

    expect(
      document.querySelector('input[name="logoImageId"]')
    ).toBeInTheDocument()
    expect(
      document.querySelector('input[name="logoImage.file"]')
    ).not.toBeRequired()
    expect(screen.getByLabelText(/show logo only/i)).not.toBeVisible()
  })

  it('offers logo-only once a logo file is picked', async () => {
    global.Image = LoadingImage as unknown as typeof Image
    renderComponent()

    fireEvent.change(
      document.querySelector('input[name="logoImage.file"]')!,
      {
        target: {
          files: [mockFile('logo.svg', 1024, 'image/svg+xml')]
        }
      }
    )

    await waitFor(() =>
      expect(screen.getByLabelText(/show logo only/i)).toBeVisible()
    )
    expect(screen.getByLabelText(/show logo only/i)).not.toBeChecked()
  })

  it('reflects a saved logo-only setting with its logo', () => {
    renderComponent({
      settings: {
        id: 'settings-1',
        isLogoOnly: true,
        logoImage: imageFixture
      }
    })

    expect(screen.getByLabelText(/show logo only/i)).toBeChecked()
  })

  // hidden rather than unmounted, so a save between logos keeps it
  it('still submits a saved logo-only setting with no logo', () => {
    renderComponent({
      settings: { id: 'settings-1', isLogoOnly: true }
    })

    const checkbox = screen.getByLabelText(/show logo only/i)
    expect(checkbox).not.toBeVisible()
    expect(checkbox).toBeChecked()
  })

  it('renders the social links picker with existing links in order', () => {
    const socialLinks = [
      { ...linkFixture, id: 'link-b', title: 'Zine' },
      { ...linkFixture, id: 'link-a', title: 'Album' }
    ]
    renderComponent({
      settings: { id: 'settings-1', socialLinks }
    })

    expect(screen.getByText('Social links')).toBeInTheDocument()
    const ids = Array.from(
      document.querySelectorAll<HTMLInputElement>(
        'input[name^="socialLinks["][name$="].id"]'
      )
    ).map((input) => [input.name, input.value])
    // the blank url form takes slot 0
    expect(ids).toEqual([
      ['socialLinks[1].id', 'link-b'],
      ['socialLinks[2].id', 'link-a']
    ])
    expect(
      document.querySelector('input[name="socialLinks[0].url"]')
    ).toBeVisible()
    expect(
      document.querySelector('input[name="socialLinks[]"]')
    ).toBeInTheDocument()
  })

  it('checks the email subscribe box by default', () => {
    renderComponent()

    expect(
      screen.getByLabelText(/show email subscribe form/i)
    ).toBeChecked()
  })

  it('reflects a disabled email subscribe setting', () => {
    renderComponent({
      settings: { id: 'settings-1', isEmailSubscribeEnabled: false }
    })

    expect(
      screen.getByLabelText(/show email subscribe form/i)
    ).not.toBeChecked()
  })

  describe('after a save', () => {
    const settings = {
      id: 'settings-1',
      createdAt: new Date('2026-01-01'),
      isEmailSubscribeEnabled: true,
      isLogoOnly: false,
      updatedAt: new Date('2026-01-01T12:00:00.100Z')
    }

    function saveTitle() {
      fireEvent.change(screen.getByLabelText(/^site title/i), {
        target: { value: 'New title' }
      })
      fireEvent.submit(document.querySelector('form')!)
    }

    beforeEach(() => {
      mockEditSiteSettings.mockResolvedValue({ ok: true })
    })

    it('goes to the About form while About is not created', async () => {
      renderComponent({ settings, isAboutCreated: false })

      saveTitle()

      await waitFor(() =>
        expect(pushMock).toHaveBeenCalledWith('/about/edit')
      )
    })

    it('goes to the homepage once About is created', async () => {
      renderComponent({ settings, isAboutCreated: true })

      saveTitle()

      await waitFor(() => expect(pushMock).toHaveBeenCalledWith('/'))
    })

    it('stays put when the save fails', async () => {
      mockEditSiteSettings.mockResolvedValue({
        ok: false,
        message: 'Nope'
      })
      renderComponent({ settings, isAboutCreated: true })

      saveTitle()

      expect(await screen.findByText('Nope')).toBeInTheDocument()
      expect(pushMock).not.toHaveBeenCalled()
    })

    it('remounts on the saved settings', async () => {
      const { rerender } = renderComponent({ settings })

      saveTitle()
      await waitFor(() => expect(pushMock).toHaveBeenCalled())

      const form = document.querySelector('form')
      rerender(
        <ToastProvider>
          <EditSettings
            settings={{
              ...settings,
              // same second: the key needs milliseconds
              updatedAt: new Date('2026-01-01T12:00:00.200Z')
            }}
          />
        </ToastProvider>
      )
      expect(document.querySelector('form')).not.toBe(form)
    })
  })

  it('shows a list error from the action under the picker', async () => {
    mockEditSiteSettings.mockResolvedValue({
      ok: false,
      message: 'Failed to validate site settings.',
      errors: { socialLinks: ['Add up to 6 social links.'] }
    })
    renderComponent({ settings: { id: 'settings-1' } })

    // unchanged forms skip submitting
    fireEvent.change(screen.getByLabelText(/^site title/i), {
      target: { value: 'New title' }
    })
    fireEvent.submit(document.querySelector('form')!)

    expect(
      await screen.findByText('Add up to 6 social links.')
    ).toBeInTheDocument()
  })
})
