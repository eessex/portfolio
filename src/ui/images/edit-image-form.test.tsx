import { render, screen } from '@testing-library/react'

import { EditImage } from '@/ui/images/edit-image-form'

jest.mock('@/lib/db', () => ({ sql: jest.fn() }))

describe('EditImage', () => {
  describe('Type select', () => {
    it('renders by default', () => {
      render(<EditImage />)
      expect(screen.getByLabelText(/^Type/)).toBeInTheDocument()
    })

    it('renders even when isPressFieldsetHidden is true', () => {
      render(<EditImage isPressFieldsetHidden />)
      expect(screen.getByLabelText(/^Type/)).toBeInTheDocument()
    })
  })

  describe('Press Image Details fieldset', () => {
    it('renders by default', () => {
      render(<EditImage />)

      expect(
        screen.getByText('Press Image Details')
      ).toBeInTheDocument()
      expect(
        screen.getByLabelText('Hide this image on the About page.')
      ).toBeInTheDocument()
    })

    it('is hidden when isPressFieldsetHidden is true', () => {
      render(<EditImage isPressFieldsetHidden />)

      expect(
        screen.queryByText('Press Image Details')
      ).not.toBeInTheDocument()
      expect(
        screen.queryByLabelText('Hide this image on the About page.')
      ).not.toBeInTheDocument()
    })

    it('shows the About-page checkbox when the image type is press', () => {
      render(<EditImage image={{ type: 'press' }} />)

      expect(
        screen.getByLabelText('Hide this image on the About page.')
      ).toBeVisible()
    })

    it('hides the About-page checkbox when the image type is not press', () => {
      render(<EditImage image={{ type: 'artwork' }} />)

      expect(
        screen.getByLabelText('Hide this image on the About page.')
      ).not.toBeVisible()
    })

    it('hides the About-page checkbox when the image has no type', () => {
      render(<EditImage />)

      expect(
        screen.getByLabelText('Hide this image on the About page.')
      ).not.toBeVisible()
    })
  })
})
