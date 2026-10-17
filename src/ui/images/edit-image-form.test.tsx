import { fireEvent, render, screen } from '@testing-library/react'

import { mockFile } from '@/test/helpers'
import { EditImage } from '@/ui/images/edit-image-form'

jest.mock('@/lib/db', () => ({ sql: jest.fn() }))

URL.createObjectURL = jest.fn(() => 'blob:mock-preview')
URL.revokeObjectURL = jest.fn()

describe('EditImage', () => {
  describe('Type select', () => {
    it('renders by default', () => {
      render(<EditImage />)
      expect(screen.getByLabelText(/^Type/)).toBeInTheDocument()
    })
  })

  describe('progressive disclosure', () => {
    const existingImage = {
      id: 'img-1',
      url: 'https://bucket.s3.amazonaws.com/images/photo.jpg',
      aspect: 1.5
    }

    it('hides secondary fields until an image is present', () => {
      render(<EditImage />)

      expect(screen.getByLabelText(/caption/i)).not.toBeVisible()
      expect(screen.getByLabelText(/alt text/i)).not.toBeVisible()
      expect(screen.getByLabelText(/^title/i)).not.toBeVisible()
      expect(screen.getByLabelText(/^type/i)).not.toBeVisible()
    })

    it('shows secondary fields immediately when editing an existing image', () => {
      render(<EditImage image={existingImage} />)

      expect(screen.getByLabelText(/caption/i)).toBeVisible()
      expect(screen.getByLabelText(/alt text/i)).toBeVisible()
      expect(screen.getByLabelText(/^title/i)).toBeVisible()
      expect(screen.getByLabelText(/^type/i)).toBeVisible()
    })

    it('wires aria-expanded/aria-controls on the file input before an image is selected', () => {
      render(<EditImage />)

      const fileInput = screen.getByLabelText(/upload new image/i)
      expect(fileInput).toHaveAttribute('aria-expanded', 'false')

      const controlsId = fileInput.getAttribute('aria-controls')
      expect(controlsId).toBeTruthy()

      const fieldset = document.getElementById(controlsId!)
      expect(fieldset).toHaveAttribute('hidden')
      expect(fieldset).toContainElement(
        screen.getByLabelText(/caption/i)
      )
    })

    it('wires aria-expanded/aria-controls on the remove button once an image is present', () => {
      render(<EditImage image={existingImage} />)

      const removeButton = screen.getByRole('button', {
        name: /remove image/i
      })
      expect(removeButton).toHaveAttribute('aria-expanded', 'true')

      const controlsId = removeButton.getAttribute('aria-controls')
      expect(controlsId).toBeTruthy()

      const fieldset = document.getElementById(controlsId!)
      expect(fieldset).not.toHaveAttribute('hidden')
    })

    it('keeps the remove button aria-expanded false during the mid-upload window before dimensions load', () => {
      render(<EditImage />)

      const fileInput = screen.getByLabelText(/upload new image/i)
      fireEvent.change(fileInput, {
        target: { files: [mockFile('photo.jpg')] }
      })

      const removeButton = screen.getByRole('button', {
        name: /remove image/i
      })
      expect(removeButton).toHaveAttribute('aria-expanded', 'false')

      const controlsId = removeButton.getAttribute('aria-controls')
      const fieldset = document.getElementById(controlsId!)
      expect(fieldset).toHaveAttribute('hidden')
    })
  })

  describe('onReadyChange', () => {
    const existingImage = {
      id: 'img-1',
      url: 'https://bucket.s3.amazonaws.com/images/photo.jpg',
      aspect: 1.5
    }

    it('reports not ready when no image is present', () => {
      const onReadyChange = jest.fn()
      render(<EditImage onReadyChange={onReadyChange} />)

      expect(onReadyChange).toHaveBeenLastCalledWith(false)
    })

    it('reports ready when rendered with an existing image', () => {
      const onReadyChange = jest.fn()
      render(
        <EditImage
          image={existingImage}
          onReadyChange={onReadyChange}
        />
      )

      expect(onReadyChange).toHaveBeenLastCalledWith(true)
    })
  })
})
