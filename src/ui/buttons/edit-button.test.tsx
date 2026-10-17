import { render, screen } from '@testing-library/react'
import { usePathname } from 'next/navigation'

import { EditButton } from '@/ui/buttons/edit-button'

jest.mock('next/navigation', () => ({
  usePathname: jest.fn()
}))
const mockUsePathname = jest.mocked(usePathname)

describe('EditButton', () => {
  it.each(['/projects/some-project', '/about'])(
    'links %s to its edit page',
    (pathname) => {
      mockUsePathname.mockReturnValue(pathname)
      render(<EditButton />)

      expect(
        screen.getByRole('link', { name: /edit page/i })
      ).toHaveAttribute('href', `${pathname}/edit`)
    }
  )

  it.each([
    '/projects',
    '/projects/some-project/edit',
    '/projects/new',
    '/about/edit',
    '/'
  ])('renders nothing on %s', (pathname) => {
    mockUsePathname.mockReturnValue(pathname)
    render(<EditButton />)

    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })
})
