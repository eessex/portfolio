import { render } from '@testing-library/react'

import { auth } from '@/auth'
import { AdminSidebar } from '@/ui/admin-sidebar/admin-sidebar'
import { IsAdminSync } from '@/ui/is-admin-sync'

jest.mock('next/server', () => ({ connection: jest.fn() }))
jest.mock('@/ui/is-admin-sync', () => ({
  IsAdminSync: jest.fn(() => null)
}))
jest.mock('@/ui/buttons/create-item-button', () => ({
  CreateItemFromPathnameButton: () => null
}))
jest.mock('@/ui/buttons/edit-button', () => ({
  EditButton: () => null
}))
jest.mock('@/ui/buttons/logout-button', () => ({
  LogoutButton: () => null
}))

const mockAuth = auth as unknown as jest.Mock

describe('AdminSidebar', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders for an admin and syncs isAdmin true', async () => {
    const { container } = render(await AdminSidebar())

    expect(container.querySelector('.admin-sidebar')).not.toBeNull()
    expect(
      container.querySelector('a[href="/dashboard/users"]')
    ).toHaveTextContent('Users')
    expect(jest.mocked(IsAdminSync).mock.calls[0]?.[0]).toEqual({
      isAdmin: true
    })
  })

  it('renders nothing visible for a visitor and syncs isAdmin false', async () => {
    mockAuth.mockResolvedValueOnce(null)

    const { container } = render(await AdminSidebar())

    expect(container).toBeEmptyDOMElement()
    expect(jest.mocked(IsAdminSync).mock.calls[0]?.[0]).toEqual({
      isAdmin: false
    })
  })
})
