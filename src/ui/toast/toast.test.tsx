import '@testing-library/jest-dom'

import {
  render,
  screen
} from '@testing-library/react'

import { Toast } from '@/ui/toast/toast'

describe('Toast', () => {
  it('renders a toast message', () => {
    render(
      <Toast
        onHide={() => {}}
        type='success'
        message='Success message'
      />
    )

    const message = screen.getByText('Success message')
    expect(message).toBeInTheDocument()
  })
})
