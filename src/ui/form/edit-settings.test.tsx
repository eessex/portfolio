import { fireEvent, render, screen } from '@testing-library/react'

import { linkFixture } from '@/lib/links/fixtures'
import { editSiteSettings } from '@/lib/site-settings/actions'
import { EditSettings } from '@/ui/form/edit-settings'
import { ToastProvider } from '@/ui/toast/toast-context'

const refreshMock = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: refreshMock })
}))

jest.mock('@/lib/site-settings/actions', () => ({
  editSiteSettings: jest.fn()
}))
const mockEditSiteSettings = jest.mocked(editSiteSettings)

jest.mock('@/lib/db', () => ({ sql: jest.fn() }))

function renderComponent(props = {}) {
  return render(
    <ToastProvider>
      <EditSettings {...props} />
    </ToastProvider>
  )
}

describe('EditSettings', () => {
  beforeEach(() => jest.clearAllMocks())

  it('renders title, description, and cover image fields', () => {
    renderComponent()

    expect(screen.getByLabelText(/site title/i)).toBeInTheDocument()
    expect(
      screen.getByLabelText(/site description/i)
    ).toBeInTheDocument()
    expect(screen.getByLabelText(/cover image/i)).toBeInTheDocument()
  })

  it('renders the create-new image fields inline without submitting', () => {
    renderComponent()

    expect(
      screen.getByLabelText(/upload new image/i)
    ).toBeInTheDocument()
    expect(mockEditSiteSettings).not.toHaveBeenCalled()
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

  it('shows a list error from the action under the picker', async () => {
    mockEditSiteSettings.mockResolvedValue({
      ok: false,
      message: 'Failed to validate site settings.',
      errors: { socialLinks: ['Add up to 6 social links.'] }
    })
    renderComponent({ settings: { id: 'settings-1' } })

    // unchanged forms skip submitting
    fireEvent.change(screen.getByLabelText(/site title/i), {
      target: { value: 'New title' }
    })
    fireEvent.submit(document.querySelector('form')!)

    expect(
      await screen.findByText('Add up to 6 social links.')
    ).toBeInTheDocument()
  })
})
