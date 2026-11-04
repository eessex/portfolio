import { fireEvent, render, screen } from '@testing-library/react'

import { CreateItemButton } from '@/ui/buttons/create-item-button'

describe('CreateItemButton', () => {
  it('links to href with a "New {type}" label', () => {
    render(
      <CreateItemButton
        itemType='images'
        href='/dashboard/images/new'
      />
    )

    expect(
      screen.getByRole('link', { name: 'New image' })
    ).toHaveAttribute('href', '/dashboard/images/new')
  })

  it('renders a button without href', () => {
    const onClick = jest.fn()
    render(<CreateItemButton label='Add' onClick={onClick} />)

    fireEvent.click(screen.getByRole('button', { name: 'Add' }))

    expect(onClick).toHaveBeenCalled()
  })

  it('prefers ariaLabel for the accessible name', () => {
    render(
      <CreateItemButton
        label='Events'
        ariaLabel='Events: create the first event'
        href='/events/new'
      />
    )

    expect(
      screen.getByRole('link', {
        name: 'Events: create the first event'
      })
    ).toHaveTextContent('Events')
  })
})
