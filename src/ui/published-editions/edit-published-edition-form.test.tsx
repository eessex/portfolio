import { fireEvent, render, screen } from '@testing-library/react'

import { publishedEditionFixtureAlpha } from '@/lib/published-editions/fixtures'
import {
  publisherFixtureAlpha,
  publisherFixtureBeta
} from '@/lib/publishers/fixtures'
import { NamePrefixProvider } from '@/ui/item-picker/name-prefix'
import { EditPublishedEdition } from '@/ui/published-editions/edit-published-edition-form'

jest.mock('@/lib/db', () => ({ sql: jest.fn() }))

const edition = {
  ...publishedEditionFixtureAlpha,
  editionSize: 500,
  publisher: publisherFixtureAlpha
}

function renderComponent(
  props = {},
  prefix = 'publishedEditions[0].'
) {
  return render(
    <NamePrefixProvider prefix={prefix}>
      <EditPublishedEdition publishedEdition={edition} {...props} />
    </NamePrefixProvider>
  )
}

describe('EditPublishedEdition', () => {
  describe('initial render', () => {
    it('renders format, publish date, publisher, edition size, and catalog number', () => {
      renderComponent()

      expect(screen.getByLabelText(/format/i)).toBeInTheDocument()
      expect(
        screen.getByLabelText(/publish date/i)
      ).toBeInTheDocument()
      expect(screen.getByText('Publisher')).toBeInTheDocument()
      expect(
        screen.getByLabelText(/edition size/i)
      ).toBeInTheDocument()
      expect(
        screen.getByLabelText(/catalog number/i)
      ).toBeInTheDocument()
    })

    it('has no release, images, or buy link fields', () => {
      renderComponent({ publishedEdition: {} })

      expect(screen.queryByText(/^release/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/^images/i)).not.toBeInTheDocument()
      expect(
        screen.queryByLabelText(/purchase link/i)
      ).not.toBeInTheDocument()
    })

    it('searches publishers, offering to create one from the query', () => {
      renderComponent({ publishedEdition: {} })

      expect(
        screen.getByPlaceholderText('Search or create by name')
      ).toBeInTheDocument()
      expect(
        screen.queryByRole('button', { name: /new publisher/i })
      ).not.toBeInTheDocument()
    })
  })

  describe('errors', () => {
    it('shows a missing publisher under the publisher picker', () => {
      renderComponent({
        publishedEdition: {},
        errors: { publisherId: ['Choose or create a publisher'] }
      })

      expect(screen.getByRole('alert')).toHaveTextContent(
        'Choose or create a publisher.'
      )
    })
  })

  describe('field names', () => {
    it("prefixes every field with its picker entry's namespace", () => {
      renderComponent()

      expect(screen.getByLabelText(/format/i)).toHaveAttribute(
        'name',
        'publishedEditions[0].format'
      )
      expect(screen.getByLabelText(/publish date/i)).toHaveAttribute(
        'name',
        'publishedEditions[0].publishDate'
      )
      expect(screen.getByLabelText(/edition size/i)).toHaveAttribute(
        'name',
        'publishedEditions[0].editionSize'
      )
      expect(
        document.querySelector(
          'input[name="publishedEditions[0].publisherId"]'
        )
      ).toHaveValue(publisherFixtureAlpha.id)
    })
  })

  describe('publisher name', () => {
    it("carries the selected publisher's name for the edition chip", () => {
      renderComponent()

      expect(
        document.querySelector(
          'input[name="publishedEditions[0].publisherName"]'
        )
      ).toHaveValue(publisherFixtureAlpha.name)
    })
  })

  describe('publisher editor', () => {
    it("shows the publisher's name and full website when opened", () => {
      renderComponent()

      fireEvent.click(screen.getByRole('button', { name: 'Edit' }))

      expect(
        screen.getByLabelText(/publisher website/i)
      ).toHaveAttribute('name', 'publishedEditions[0].publisher.url')
      expect(screen.getByLabelText(/publisher website/i)).toHaveValue(
        publisherFixtureAlpha.url
      )
      expect(screen.getByLabelText(/^name/i)).toHaveValue(
        publisherFixtureAlpha.name
      )
      expect(
        screen.queryByLabelText(/^type/i)
      ).not.toBeInTheDocument()
    })
  })

  describe('built-in publisher', () => {
    it('offers no Edit on the Self-released chip', () => {
      renderComponent({
        publishedEdition: {
          ...edition,
          publisher: {
            ...publisherFixtureAlpha,
            name: 'Self-released',
            isBuiltIn: true
          }
        }
      })

      expect(screen.getByText('Self-released')).toBeInTheDocument()
      expect(
        screen.queryByRole('button', { name: 'Edit' })
      ).not.toBeInTheDocument()
    })
  })

  describe('default publisher', () => {
    it('starts a new edition on it', () => {
      renderComponent({
        publishedEdition: undefined,
        defaultPublisher: publisherFixtureBeta
      })

      expect(
        document.querySelector(
          'input[name="publishedEditions[0].publisherId"]'
        )
      ).toHaveValue(publisherFixtureBeta.id)
      expect(
        document.querySelector(
          'input[name="publishedEditions[0].publisherName"]'
        )
      ).toHaveValue(publisherFixtureBeta.name)
    })

    it("keeps an existing edition's own publisher", () => {
      renderComponent({ defaultPublisher: publisherFixtureBeta })

      expect(
        document.querySelector(
          'input[name="publishedEditions[0].publisherId"]'
        )
      ).toHaveValue(publisherFixtureAlpha.id)
    })
  })

  describe('default values', () => {
    it('sets each input from the edition', () => {
      renderComponent()

      expect(screen.getByLabelText(/format/i)).toHaveValue('LP')
      expect(screen.getByLabelText(/publish date/i)).toHaveValue(
        '2020-01-01'
      )
      expect(screen.getByLabelText(/edition size/i)).toHaveValue(500)
      expect(screen.getByLabelText(/catalog number/i)).toHaveValue(
        'SL021'
      )
      expect(
        screen.getByText(publisherFixtureAlpha.name)
      ).toBeInTheDocument()
    })

    it('marks format and publish date required', () => {
      renderComponent({ publishedEdition: {} })

      expect(screen.getByLabelText(/format/i)).toBeRequired()
      expect(screen.getByLabelText(/publish date/i)).toBeRequired()
      expect(
        screen.getByLabelText(/edition size/i)
      ).not.toBeRequired()
    })
  })
})
