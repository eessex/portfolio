import { render, screen } from '@testing-library/react'

import { EditImage } from '@/ui/images/edit-image-form'

jest.mock('@/lib/db', () => ({ sql: jest.fn() }))

describe('EditImage', () => {
  describe('Press Image Details fieldset', () => {
    it('renders by default', () => {
      render(<EditImage />)

      expect(
        screen.getByText('Press Image Details')
      ).toBeInTheDocument()
      expect(
        screen.getByLabelText(/this is a press image/i)
      ).toBeInTheDocument()
    })

    it('is hidden when isPressFieldsetHidden is true', () => {
      render(<EditImage isPressFieldsetHidden />)

      expect(
        screen.queryByText('Press Image Details')
      ).not.toBeInTheDocument()
      expect(
        screen.queryByLabelText(/this is a press image/i)
      ).not.toBeInTheDocument()
    })
  })
})
