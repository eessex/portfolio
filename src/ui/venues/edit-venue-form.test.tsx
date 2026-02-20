import {
  render,
  screen
} from '@testing-library/react'

import {
  newVenueFixtureAlpha,
  venueFixtureAlpha
} from '@/lib/venues/fixtures'
import { EditVenue } from '@/ui/venues/edit-venue-form'

function renderComponent (props = {}) {
  return render(
    <EditVenue
      venue={newVenueFixtureAlpha}
      {...props}
    />
  )
}

describe('EditVenue', () => {
  describe('initial render', () => {
    it('renders name, address, city, state, country, and URL inputs', () => {
      renderComponent()

      expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/street address/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/city/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/state/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/country/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/venue website/i)).toBeInTheDocument()
    })

    it('renders hidden ID input if venue.id is provided', () => {
      renderComponent({ venue: venueFixtureAlpha })

      const idInput = screen.getByDisplayValue(venueFixtureAlpha.id)
      expect(idInput).toBeInTheDocument()
      expect(idInput).toHaveAttribute('type', 'hidden')
      expect(idInput).toHaveAttribute('name', 'id')
      expect(screen.queryByLabelText(/venue id/i)).not.toBeInTheDocument()
    })

    it('renders description for name and URL inputs', () => {
      renderComponent()
      expect(
        screen.getByText(/if the venue has no name, leave this blank\./i)
      ).toBeInTheDocument()
      expect(
        screen.getByText(/the homepage or profile of the venue, not a ticket link\./i)
      ).toBeInTheDocument()
    })

    it('applies isPrefixEnabled to prefix to input names correctly', () => {
      renderComponent({
        venue: venueFixtureAlpha,
        isPrefixEnabled: true
      })

      expect(screen.getByLabelText(/name/i)).toHaveAttribute('name', 'venue.name')
      expect(screen.getByLabelText(/street address/i)).toHaveAttribute('name', 'venue.address')
      expect(screen.getByLabelText(/^city$/i)).toHaveAttribute('name', 'venue.city')
      expect(screen.getByLabelText(/^state$/i)).toHaveAttribute('name', 'venue.state')
      expect(screen.getByLabelText(/^country$/i)).toHaveAttribute('name', 'venue.country')
      expect(screen.getByLabelText(/venue website/i)).toHaveAttribute('name', 'venue.url')
    })
  })

  describe('default values', () => {
    it('sets defaultValue for each input from the venue prop', () => {
      renderComponent({ venue: venueFixtureAlpha })

      expect(screen.getByLabelText(/name/i))
        .toHaveValue('Test Venue Texas')

      expect(screen.getByLabelText(/street address/i))
        .toHaveValue('123 Main St')

      expect(screen.getByLabelText(/^city$/i))
        .toHaveValue('Austin')

      expect(screen.getByLabelText(/^state$/i))
        .toHaveValue('TX')

      expect(screen.getByLabelText(/^country$/i))
        .toHaveValue('USA')

      expect(screen.getByLabelText(/venue website/i))
        .toHaveValue('https://testvenue-texas.com')
    })

    it('handles partial venue data without errors', () => {
      renderComponent({ venue: { city: 'Austin' } })

      expect(screen.getByLabelText(/^city$/i)).toHaveValue('Austin')
      expect(screen.getByLabelText(/name/i)).toHaveValue('')
      expect(screen.getByLabelText(/street address/i)).toHaveValue('')
      expect(screen.getByLabelText(/^state$/i)).toHaveValue('')
      expect(screen.getByLabelText(/^country$/i)).toHaveValue('')
      expect(screen.getByLabelText(/venue website/i)).toHaveValue('')
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
      const errors = { name: ['Name is required', 'Name must be under 255 characters'] }
      renderComponent({ errors })

      expect(screen.getByText(/name is required/i)).toBeInTheDocument()
      expect(screen.getByText(/name must be under 255 characters/i)).toBeInTheDocument()
    })
  })

  describe('input attributes', () => {
    it('applies maxLength, placeholder, type, and required attributes correctly', () => {
      renderComponent()

      const nameInput = screen.getByLabelText(/name/i)
      expect(nameInput).toHaveAttribute('maxlength', '255')
      expect(nameInput).toHaveAttribute('placeholder', 'CBGB')
      expect(nameInput).toHaveAttribute('type', 'text') // default input type

      const addressInput = screen.getByLabelText(/street address/i)
      expect(addressInput).toHaveAttribute('maxlength', '255')
      expect(addressInput).toHaveAttribute('placeholder', '123 Main St')

      const cityInput = screen.getByLabelText(/^city$/i)
      expect(cityInput).toHaveAttribute('maxlength', '255')
      expect(cityInput).toHaveAttribute('placeholder', 'Brooklyn')
      expect(cityInput).toBeRequired()

      const stateInput = screen.getByLabelText(/^state$/i)
      expect(stateInput).toHaveAttribute('maxlength', '2')
      expect(stateInput).toHaveAttribute('placeholder', 'NY')

      const countryInput = screen.getByLabelText(/^country$/i)
      expect(countryInput).toHaveAttribute('maxlength', '255')
      expect(countryInput).toHaveAttribute('placeholder', 'USA')

      const urlInput = screen.getByLabelText(/venue website/i)
      expect(urlInput).toHaveAttribute('maxlength', '255')
      expect(urlInput).toHaveAttribute('placeholder', 'https://cbgb.com')
      expect(urlInput).toHaveAttribute('type', 'url')
    })
  })
})
