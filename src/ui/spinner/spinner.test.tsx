import { render, screen } from '@testing-library/react'

import { Spinner } from '@/ui/spinner/spinner'

describe('Spinner', () => {
  it('announces a default label as a status', () => {
    render(<Spinner />)

    expect(screen.getByRole('status')).toHaveTextContent('Loading')
  })

  it('announces a custom label', () => {
    render(<Spinner label='Loading image' />)

    expect(screen.getByRole('status')).toHaveTextContent(
      'Loading image'
    )
  })

  it('adds a className', () => {
    render(<Spinner className='extra' />)

    expect(screen.getByRole('status')).toHaveClass('extra')
  })
})
