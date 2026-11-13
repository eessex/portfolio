import { render, screen } from '@testing-library/react'

import { EditItemHeader } from '@/app/(item-pages)/admin-header'
import { isAuthed } from '@/lib/auth/guard'

jest.mock('next/server', () => ({ connection: jest.fn() }))
jest.mock('@/lib/auth/guard', () => ({ isAuthed: jest.fn() }))

const mockIsAuthed = jest.mocked(isAuthed)

describe('EditItemHeader', () => {
  it('links admins to the edit form', async () => {
    mockIsAuthed.mockResolvedValue(true)

    render(await EditItemHeader({ href: '/events/spring-tour/edit' }))

    expect(
      screen.getByRole('link', { name: 'Edit' })
    ).toHaveAttribute('href', '/events/spring-tour/edit')
  })

  it('renders nothing for visitors', async () => {
    mockIsAuthed.mockResolvedValue(false)

    expect(
      await EditItemHeader({ href: '/events/spring-tour/edit' })
    ).toBeNull()
  })
})
