import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

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

  it('renders the create-new image fields inline without submitting', async () => {
    const user = userEvent.setup()
    renderComponent()

    const coverImageInput = screen.getByLabelText(/cover image/i)
    await user.type(coverImageInput, 'New Image')
    await user.click(screen.getByText(/create image/i))

    expect(
      screen.getByLabelText(/upload new image/i)
    ).toBeInTheDocument()
    expect(mockEditSiteSettings).not.toHaveBeenCalled()
  })
})
