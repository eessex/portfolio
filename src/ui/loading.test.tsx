import { render, screen } from '@testing-library/react'

import { Loading } from '@/ui/loading'

describe('Loading', () => {
  it('renders a status region so screen readers announce it', () => {
    render(<Loading />)

    const status = screen.getByRole('status')
    expect(status).toHaveTextContent('Loading...')
  })

  it('applies a custom className when provided', () => {
    render(<Loading className='custom-loading' />)

    expect(screen.getByRole('status')).toHaveClass('custom-loading')
  })
})
