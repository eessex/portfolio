import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { editAbout } from '@/lib/about/actions'
import type { AboutClient } from '@/lib/about/types'
import { EditAboutForm } from '@/ui/form/edit-about'
import { ToastProvider } from '@/ui/toast/toast-context'

jest.mock('next/navigation', () => ({
  useRouter: () => ({})
}))

jest.mock('@/lib/about/actions', () => ({
  editAbout: jest.fn()
}))
const mockEditAbout = jest.mocked(editAbout)

jest.mock('@/lib/db', () => ({ sql: jest.fn() }))

const aboutFixture: AboutClient = {
  id: 'a3b8c8e2-4f8a-4c2a-9e2a-2f8b8c8e2f8a',
  createdAt: new Date('2024-01-01T12:00:00Z'),
  slug: 'about'
}

function renderComponent(props = {}) {
  return render(
    <ToastProvider>
      <EditAboutForm about={aboutFixture} {...props} />
    </ToastProvider>
  )
}

describe('EditAboutForm', () => {
  beforeEach(() => jest.clearAllMocks())

  it('renders description and cover image fields', () => {
    renderComponent()

    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/cover image/i)).toBeInTheDocument()
  })

  it('renders the create-new image fields inline without submitting', async () => {
    const user = userEvent.setup()
    renderComponent()

    const coverImageInput = screen.getByLabelText(/cover image/i)
    await user.type(coverImageInput, 'Image')
    await user.click(screen.getByText(/new image/i))

    expect(
      screen.getByLabelText(/upload new image/i)
    ).toBeInTheDocument()
    expect(mockEditAbout).not.toHaveBeenCalled()
  })
})
