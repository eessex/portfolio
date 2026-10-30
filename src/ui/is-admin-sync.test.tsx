import { render } from '@testing-library/react'

import { IsAdminSync } from '@/ui/is-admin-sync'
import { syncIsAdmin } from '@/ui/use-is-admin'

jest.mock('@/ui/use-is-admin', () => ({ syncIsAdmin: jest.fn() }))

describe('IsAdminSync', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('syncs the session on mount and when it changes', () => {
    const { rerender } = render(<IsAdminSync isAdmin={false} />)
    expect(syncIsAdmin).toHaveBeenLastCalledWith(false)

    rerender(<IsAdminSync isAdmin />)
    expect(syncIsAdmin).toHaveBeenLastCalledWith(true)
    expect(syncIsAdmin).toHaveBeenCalledTimes(2)
  })

  it('does not resync an unchanged session', () => {
    const { rerender } = render(<IsAdminSync isAdmin />)
    rerender(<IsAdminSync isAdmin />)

    expect(syncIsAdmin).toHaveBeenCalledTimes(1)
  })
})
