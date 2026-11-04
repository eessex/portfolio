import { render, screen } from '@testing-library/react'

import { DashboardLayout } from '@/ui/dashboard/dashboard-layout'

describe('DashboardLayout', () => {
  it.each([
    ['images', 'New image', '/dashboard/images/new'],
    ['embedCodes', 'New embed code', '/dashboard/embed_codes/new']
  ] as const)(
    'offers "New" for %s in the header',
    (itemType, name, href) => {
      render(
        <DashboardLayout title='Dashboard' itemType={itemType}>
          <p>List</p>
        </DashboardLayout>
      )

      expect(screen.getByRole('link', { name })).toHaveAttribute(
        'href',
        href
      )
    }
  )

  it('renders no "New" link without an item type', () => {
    render(
      <DashboardLayout title='Dashboard'>
        <p>Settings</p>
      </DashboardLayout>
    )

    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })
})
