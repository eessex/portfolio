import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type { Contact } from '@/lib/schemas/fields'
import { ContactInfoFields } from '@/ui/projects/contact-info-fields'

/** the `contactInfo[i].contact` input of every rendered row */
function contactInputs(container: HTMLElement) {
  return container.querySelectorAll('input[name$=".contact"]')
}

function addButton() {
  return screen.getByRole('button', { name: /add contact/i })
}

function saveButton() {
  return screen.getByRole('button', { name: /^save contact$/i })
}

function cancelButton() {
  return screen.getByRole('button', { name: /^cancel$/i })
}

/** the open row's `Contact` input — its label gains an "optional"
 *  suffix until the row is `required`, so match on the prefix. */
function contactField() {
  return screen.getByLabelText(/^contact\b/i)
}

describe('ContactInfoFields', () => {
  it('seeds a saved row per existing contact, with "Add contact" visible', () => {
    const contactInfo: Contact[] = [
      { title: 'Bookings', contact: 'bookings@example.com' },
      { contact: 'press@example.com' }
    ]
    const { container } = render(
      <ContactInfoFields contactInfo={contactInfo} />
    )

    expect(contactInputs(container)).toHaveLength(2)
    expect(
      screen.getByText('bookings@example.com')
    ).toBeInTheDocument()
    expect(screen.getByText('press@example.com')).toBeInTheDocument()
    expect(
      screen.getAllByRole('button', { name: /remove contact/i })
    ).toHaveLength(2)
    expect(addButton()).toBeInTheDocument()
  })

  it('shows an open row by default instead of "Add contact"', () => {
    render(<ContactInfoFields />)

    expect(contactField()).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /add contact/i })
    ).not.toBeInTheDocument()
  })

  it('saves a row, collapsing it into a compact view and revealing "Add contact"', async () => {
    const user = userEvent.setup()
    render(<ContactInfoFields />)

    await user.type(contactField(), 'hi@example.com')
    await user.click(saveButton())

    expect(screen.getByText('hi@example.com')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /remove contact/i })
    ).toBeInTheDocument()
    expect(
      screen.queryByLabelText(/^contact\b/i)
    ).not.toBeInTheDocument()
    expect(addButton()).toBeInTheDocument()
  })

  it('does not save an incomplete row', async () => {
    const user = userEvent.setup()
    render(<ContactInfoFields />)

    await user.type(screen.getByLabelText(/^label\b/i), 'Bookings')
    await user.click(saveButton())

    // still open, since `contact` is required by `contactSchema`
    expect(contactField()).toBeInTheDocument()
  })

  it('hides Save and Cancel on a still-blank row', () => {
    render(<ContactInfoFields />)

    expect(
      screen.queryByRole('button', { name: /^save contact$/i })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /^cancel$/i })
    ).not.toBeInTheDocument()
  })

  it('cancels an open row once it has content, reseeding a blank one', async () => {
    const user = userEvent.setup()
    render(<ContactInfoFields />)

    await user.type(contactField(), 'hi@example.com')
    await user.click(cancelButton())

    // cancelling the only row can't leave the section with none at
    // all — a fresh blank row takes its place
    expect(contactField()).toHaveValue('')
  })

  it('hides "Add contact" while a row is open, focusing the new row', async () => {
    const user = userEvent.setup()
    const contactInfo: Contact[] = [{ contact: 'a@example.com' }]
    const { container } = render(
      <ContactInfoFields contactInfo={contactInfo} />
    )

    await user.click(addButton())

    expect(contactInputs(container)).toHaveLength(2)
    expect(
      screen.queryByRole('button', { name: /add contact/i })
    ).not.toBeInTheDocument()
    expect(screen.getByLabelText(/^label\b/i)).toHaveFocus()
  })

  it('renders the open row above saved rows, submitting it after them', async () => {
    const user = userEvent.setup()
    const contactInfo: Contact[] = [{ contact: 'a@example.com' }]
    const { container } = render(
      <ContactInfoFields contactInfo={contactInfo} />
    )

    await user.click(addButton())

    const [first, second] = contactInputs(container)
    expect(first).toHaveAttribute('name', 'contactInfo[1].contact')
    expect(first).not.toHaveAttribute('type', 'hidden')
    expect(second).toHaveAttribute('name', 'contactInfo[0].contact')
  })

  it('returns focus to "Add contact" after cancelling an open row', async () => {
    const user = userEvent.setup()
    const contactInfo: Contact[] = [{ contact: 'a@example.com' }]
    render(<ContactInfoFields contactInfo={contactInfo} />)

    await user.click(addButton())
    await user.type(contactField(), 'b@example.com')
    await user.click(cancelButton())

    expect(addButton()).toHaveFocus()
  })

  it('allows adding another row once the first is saved', async () => {
    const user = userEvent.setup()
    const { container } = render(<ContactInfoFields />)

    await user.type(contactField(), 'hi@example.com')
    await user.click(saveButton())
    expect(addButton()).toHaveFocus()
    await user.click(addButton())

    expect(contactInputs(container)).toHaveLength(2)
    expect(contactField()).toBeInTheDocument()
  })

  it('removes a saved row, reseeding an open one and hiding "Add contact"', async () => {
    const user = userEvent.setup()
    const contactInfo: Contact[] = [{ contact: 'a@example.com' }]
    const { container } = render(
      <ContactInfoFields contactInfo={contactInfo} />
    )

    expect(contactInputs(container)).toHaveLength(1)
    await user.click(
      screen.getByRole('button', { name: /remove contact/i })
    )

    expect(contactField()).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /add contact/i })
    ).not.toBeInTheDocument()
  })
})
