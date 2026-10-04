import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type { Contact } from '@/lib/schemas/fields'
import { ContactInfoFields } from '@/ui/projects/contact-info-fields'

/** the `contactInfo[i].contact` input of every rendered row */
function contactInputs(container: HTMLElement) {
  return container.querySelectorAll<HTMLInputElement>(
    'input[name$=".contact"]'
  )
}

function titleInputs(container: HTMLElement) {
  return container.querySelectorAll<HTMLInputElement>(
    'input[name$=".title"]'
  )
}

const contactLabelText = 'Email, phone, or link'

function addButton() {
  return screen.getByRole('button', { name: /add contact/i })
}

function queryAddButton() {
  return screen.queryByRole('button', { name: /add contact/i })
}

function removeButtons() {
  return screen.queryAllByRole('button', { name: /remove contact/i })
}

describe('ContactInfoFields', () => {
  it('renders an editable row per existing contact, with "Add contact" visible', () => {
    const contactInfo: Contact[] = [
      { title: 'Bookings', contact: 'bookings@example.com' },
      { contact: 'press@example.com' }
    ]
    const { container } = render(
      <ContactInfoFields contactInfo={contactInfo} />
    )

    const contacts = contactInputs(container)
    expect(contacts).toHaveLength(2)
    expect(contacts[0]).toHaveAttribute(
      'name',
      'contactInfo[0].contact'
    )
    expect(contacts[0]).toHaveValue('bookings@example.com')
    expect(contacts[1]).toHaveValue('press@example.com')
    expect(titleInputs(container)[0]).toHaveValue('Bookings')
    expect(removeButtons()).toHaveLength(2)
    expect(addButton()).toBeInTheDocument()
  })

  it('shows the column labels only on the first row, visually hiding the rest', () => {
    const contactInfo: Contact[] = [
      { contact: 'a@example.com' },
      { contact: 'b@example.com' }
    ]
    render(<ContactInfoFields contactInfo={contactInfo} />)

    const [first, second] = screen.getAllByText(contactLabelText, {
      selector: 'label'
    })
    expect(first).not.toHaveClass('visually-hidden')
    expect(second).toHaveClass('visually-hidden')
    // still labelled for assistive tech
    expect(screen.getAllByLabelText(contactLabelText)).toHaveLength(2)
  })

  it('marks only the label field "optional", never the contact field', async () => {
    const user = userEvent.setup()
    const { container } = render(<ContactInfoFields />)
    const labelsText = () =>
      Array.from(container.querySelectorAll('label')).map(
        (label) => label.textContent
      )

    expect(labelsText()).toEqual([contactLabelText, 'Label optional'])

    // the contact field becoming required doesn't change its heading
    await user.type(titleInputs(container)[0], 'Bookings')
    expect(labelsText()).toEqual([contactLabelText, 'Label optional'])
  })

  it('shows a lone blank row with no "Add contact" or remove button', () => {
    const { container } = render(<ContactInfoFields />)

    expect(contactInputs(container)).toHaveLength(1)
    expect(contactInputs(container)[0]).not.toBeRequired()
    expect(queryAddButton()).not.toBeInTheDocument()
    expect(removeButtons()).toHaveLength(0)
  })

  it('always submits the empty-list marker', () => {
    const { container } = render(<ContactInfoFields />)

    expect(
      container.querySelector('input[name="contactInfo[]"]')
    ).toBeInTheDocument()
  })

  it('shows "Add contact" once every row is valid', async () => {
    const user = userEvent.setup()
    const { container } = render(<ContactInfoFields />)

    await user.type(contactInputs(container)[0], 'hi@example.com')

    expect(addButton()).toBeInTheDocument()
  })

  it('treats a literal "on" as free text, not a checkbox value', async () => {
    const user = userEvent.setup()
    const { container } = render(<ContactInfoFields />)

    await user.type(contactInputs(container)[0], 'on')
    await user.type(titleInputs(container)[0], 'off')

    expect(addButton()).toBeInTheDocument()
  })

  it('requires the contact once a label is entered, keeping "Add contact" hidden', async () => {
    const user = userEvent.setup()
    const { container } = render(<ContactInfoFields />)

    await user.type(titleInputs(container)[0], 'Bookings')

    expect(contactInputs(container)[0]).toBeRequired()
    expect(queryAddButton()).not.toBeInTheDocument()
  })

  it('appends and focuses a new row, hiding "Add contact" until it is filled', async () => {
    const user = userEvent.setup()
    const contactInfo: Contact[] = [{ contact: 'a@example.com' }]
    const { container } = render(
      <ContactInfoFields contactInfo={contactInfo} />
    )

    await user.click(addButton())

    const contacts = contactInputs(container)
    expect(contacts).toHaveLength(2)
    expect(contacts[1]).toHaveAttribute(
      'name',
      'contactInfo[1].contact'
    )
    expect(contactInputs(container)[1]).toHaveFocus()
    expect(queryAddButton()).not.toBeInTheDocument()

    await user.type(contacts[1], 'b@example.com')
    expect(addButton()).toBeInTheDocument()
  })

  it('removes a row, reindexing the rest and focusing the previous row', async () => {
    const user = userEvent.setup()
    const contactInfo: Contact[] = [
      { contact: 'a@example.com' },
      { contact: 'b@example.com' },
      { contact: 'c@example.com' }
    ]
    const { container } = render(
      <ContactInfoFields contactInfo={contactInfo} />
    )

    await user.click(removeButtons()[1])

    const contacts = contactInputs(container)
    expect(contacts).toHaveLength(2)
    expect(contacts[1]).toHaveValue('c@example.com')
    expect(contacts[1]).toHaveAttribute(
      'name',
      'contactInfo[1].contact'
    )
    expect(contactInputs(container)[0]).toHaveFocus()
  })

  it('reseeds a blank row when the last one is removed', async () => {
    const user = userEvent.setup()
    const contactInfo: Contact[] = [{ contact: 'a@example.com' }]
    const { container } = render(
      <ContactInfoFields contactInfo={contactInfo} />
    )

    await user.click(removeButtons()[0])

    expect(contactInputs(container)).toHaveLength(1)
    expect(contactInputs(container)[0]).toHaveValue('')
    expect(contactInputs(container)[0]).toHaveFocus()
    expect(queryAddButton()).not.toBeInTheDocument()
  })
})
