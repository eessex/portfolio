import { render, screen } from '@testing-library/react'
import { usePathname } from 'next/navigation'

import { CreateItemFromPathnameButton } from '@/ui/buttons/create-item-button'

jest.mock('next/navigation', () => ({
  usePathname: jest.fn()
}))
const mockUsePathname = jest.mocked(usePathname)

describe('CreateItemFromPathnameButton', () => {
  it('renders a "New" link for an embedded item dashboard list page', () => {
    mockUsePathname.mockReturnValue('/dashboard/images')
    render(<CreateItemFromPathnameButton />)

    const link = screen.getByRole('link', { name: /create image/i })
    expect(link).toHaveAttribute('href', '/dashboard/images/new')
  })

  it('renders a "New" link for a page type\'s public list page', () => {
    mockUsePathname.mockReturnValue('/projects')
    render(<CreateItemFromPathnameButton />)

    const link = screen.getByRole('link', { name: /create project/i })
    expect(link).toHaveAttribute('href', '/projects/new')
  })

  it('renders nothing on the about page (singleton, no create flow)', () => {
    mockUsePathname.mockReturnValue('/about')
    render(<CreateItemFromPathnameButton />)

    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it("renders nothing on a page item's detail page", () => {
    mockUsePathname.mockReturnValue('/projects/some-project')
    render(<CreateItemFromPathnameButton />)

    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('renders nothing on an unrelated page', () => {
    mockUsePathname.mockReturnValue('/')
    render(<CreateItemFromPathnameButton />)

    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('renders nothing for an unrecognized dashboard item type', () => {
    mockUsePathname.mockReturnValue('/dashboard/unknown')
    render(<CreateItemFromPathnameButton />)

    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })
})
