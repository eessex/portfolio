import { render, screen } from '@testing-library/react'

import { imageFixture } from '@/lib/images/fixtures'
import { linkFixture } from '@/lib/links/fixtures'
import { publishedEditionFixtureAlpha } from '@/lib/published-editions/fixtures'
import { publisherFixtureAlpha } from '@/lib/publishers/fixtures'
import { ReleaseTypes } from '@/lib/releases/schemas'
import { EditPublishedEdition } from '@/ui/published-editions/edit-published-edition-form'

function renderComponent(props = {}) {
  return render(
    <EditPublishedEdition
      publishedEdition={publishedEditionFixtureAlpha}
      {...props}
    />
  )
}

describe('EditPublishedEdition', () => {
  describe('initial render', () => {
    it('renders publisher, format, publish date, edition size, and catalog number inputs', () => {
      renderComponent()

      expect(screen.getByLabelText(/publisher/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/format/i)).toBeInTheDocument()
      expect(
        screen.getByLabelText(/publish date/i)
      ).toBeInTheDocument()
      expect(
        screen.getByLabelText(/edition size/i)
      ).toBeInTheDocument()
      expect(
        screen.getByLabelText(/catalog number/i)
      ).toBeInTheDocument()
    })

    it('renders a release search input when no release is attached', () => {
      renderComponent({ publishedEdition: {} })

      expect(screen.getByLabelText('Release')).toBeInTheDocument()
    })

    it('renders search inputs for cover image and buy link when none is attached', () => {
      renderComponent({ publishedEdition: {} })

      expect(
        screen.getByLabelText(/product image/i)
      ).toBeInTheDocument()
      expect(
        screen.getByLabelText(/purchase link/i)
      ).toBeInTheDocument()
    })
  })

  describe('default values', () => {
    it('sets defaultValue for each input from the edition prop', () => {
      renderComponent()

      expect(
        (screen.getByLabelText(/publish date/i) as HTMLInputElement)
          .value
      ).toBe('2020-01-01')
      expect(screen.getByLabelText(/catalog number/i)).toHaveValue(
        publishedEditionFixtureAlpha.catalogNumber
      )
    })

    it('shows the currently attached publisher when provided', () => {
      renderComponent({
        publishedEdition: {
          ...publishedEditionFixtureAlpha,
          publisher: publisherFixtureAlpha
        }
      })

      expect(
        screen.getByText(publisherFixtureAlpha.name)
      ).toBeInTheDocument()
    })

    it('shows the currently attached release when release is provided', () => {
      renderComponent({
        publishedEdition: {
          ...publishedEditionFixtureAlpha,
          release: {
            id: publishedEditionFixtureAlpha.releaseId,
            title: 'Test Release',
            type: ReleaseTypes.album
          }
        }
      })

      expect(screen.getByText('Test Release')).toBeInTheDocument()
    })

    it('shows the currently attached publisher when publisher is provided', () => {
      renderComponent({
        publishedEdition: {
          ...publishedEditionFixtureAlpha,
          publisher: publisherFixtureAlpha
        }
      })

      expect(
        screen.getByText(publisherFixtureAlpha.name)
      ).toBeInTheDocument()
    })

    it('shows the currently attached cover image and buy link', () => {
      renderComponent({
        publishedEdition: {
          ...publishedEditionFixtureAlpha,
          coverImage: imageFixture,
          buyLink: linkFixture
        }
      })

      expect(
        screen.getByText(imageFixture.title!)
      ).toBeInTheDocument()
      expect(screen.getByText(linkFixture.title!)).toBeInTheDocument()
    })
  })

  describe('error display', () => {
    it('handles errors passed via the errors prop', () => {
      const errors = {
        catalogNumber: ['Catalog number is invalid']
      }
      renderComponent({ errors })

      expect(
        screen.getByText(/catalog number is invalid/i)
      ).toBeInTheDocument()
    })
  })
})
