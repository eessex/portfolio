import { render, screen } from '@testing-library/react'

import {
  newPublisherFixtureAlpha,
  publisherFixtureAlpha
} from '@/lib/publishers/fixtures'
import { EditPublisher } from '@/ui/publishers/edit-publisher-form'

function renderComponent(props = {}) {
  return render(
    <EditPublisher publisher={newPublisherFixtureAlpha} {...props} />
  )
}

describe('EditPublisher', () => {
  describe('initial render', () => {
    it('renders name, type, and URL inputs', () => {
      renderComponent()

      expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/type/i)).toBeInTheDocument()
      expect(
        screen.getByLabelText(/publisher website/i)
      ).toBeInTheDocument()
    })

    it('renders description for the URL input', () => {
      renderComponent()
      expect(
        screen.getByText(
          /the homepage or profile of the publisher\./i
        )
      ).toBeInTheDocument()
    })
  })

  describe('default values', () => {
    it('sets defaultValue for each input from the publisher prop', () => {
      renderComponent({ publisher: publisherFixtureAlpha })

      expect(screen.getByLabelText(/name/i)).toHaveValue(
        'Soap Library'
      )
      expect(screen.getByLabelText(/type/i)).toHaveValue(
        'recordLabel'
      )
      expect(screen.getByLabelText(/publisher website/i)).toHaveValue(
        'https://soaplibrary.example.com'
      )
    })

    it('handles partial publisher data without errors', () => {
      renderComponent({
        publisher: { name: publisherFixtureAlpha.name }
      })

      expect(screen.getByLabelText(/name/i)).toHaveValue(
        'Soap Library'
      )
      expect(screen.getByLabelText(/publisher website/i)).toHaveValue(
        ''
      )
    })
  })

  describe('error display', () => {
    it('handles errors passed via the errors prop', () => {
      const errors = { name: ['Name is required'] }
      renderComponent({ errors })

      const input = screen.getByLabelText(/name/i)
      const error = screen.getByText(/name is required/i)
      expect(error).toBeInTheDocument()

      const describedBy = input.getAttribute('aria-describedby')
      expect(describedBy).toBeTruthy()

      const ids = describedBy!.split(' ')
      expect(ids).toContain(error.id)
    })

    it('handles multiple errors per field', () => {
      const errors = {
        name: [
          'Name is required',
          'Name must be under 255 characters'
        ]
      }
      renderComponent({ errors })

      expect(
        screen.getByText(/name is required/i)
      ).toBeInTheDocument()
      expect(
        screen.getByText(/name must be under 255 characters/i)
      ).toBeInTheDocument()
    })
  })

  describe('input attributes', () => {
    it('applies maxLength, placeholder, type, and required attributes correctly', () => {
      renderComponent()

      const nameInput = screen.getByLabelText(/name/i)
      expect(nameInput).toHaveAttribute('maxlength', '255')
      expect(nameInput).toHaveAttribute('placeholder', 'Soap Library')
      expect(nameInput).toBeRequired()

      const typeSelect = screen.getByLabelText(/type/i)
      expect(typeSelect).toBeRequired()

      const urlInput = screen.getByLabelText(/publisher website/i)
      expect(urlInput).toHaveAttribute('maxlength', '255')
      expect(urlInput).toHaveAttribute(
        'placeholder',
        'https://example.com'
      )
      expect(urlInput).toHaveAttribute('type', 'url')
    })
  })
})
