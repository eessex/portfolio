import { render, screen } from '@testing-library/react'

import { Pagination } from '@/ui/pagination/pagination'

describe('Pagination', () => {
  it('renders nothing for a single page', () => {
    const { container } = render(
      <Pagination page={1} pageCount={1} basePath='/x' />
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('links the neighbouring pages', () => {
    render(<Pagination page={2} pageCount={3} basePath='/x' />)
    expect(
      screen.getByRole('link', { name: 'Previous' })
    ).toHaveAttribute('href', '/x')
    expect(
      screen.getByRole('link', { name: 'Next' })
    ).toHaveAttribute('href', '/x?page=3')
    expect(screen.getByText('Page 2 of 3')).toBeInTheDocument()
  })

  it('disables Next on the last page', () => {
    render(<Pagination page={3} pageCount={3} basePath='/x' />)
    expect(
      screen.queryByRole('link', { name: 'Next' })
    ).not.toBeInTheDocument()
    expect(screen.getByText('Next')).toHaveAttribute(
      'aria-disabled',
      'true'
    )
  })

  it('keeps the other page and adds the fragment', () => {
    render(
      <Pagination
        page={2}
        pageCount={3}
        basePath='/x'
        param='spamPage'
        otherPages={{ page: 4 }}
        fragment='spam'
      />
    )
    expect(
      screen.getByRole('link', { name: 'Previous' })
    ).toHaveAttribute('href', '/x?page=4#spam')
    expect(
      screen.getByRole('link', { name: 'Next' })
    ).toHaveAttribute('href', '/x?page=4&spamPage=3#spam')
  })
})
