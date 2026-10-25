import { fireEvent, render, screen } from '@testing-library/react'

import {
  DisclosureDetails,
  useDisclosureDetails
} from '@/ui/form/disclosure-details'

function Form({
  isRevealed,
  isKeptWithContent
}: {
  isRevealed: boolean
  isKeptWithContent?: boolean
}) {
  const disclosure = useDisclosureDetails({
    isRevealed,
    isKeptWithContent
  })
  return (
    <>
      <button type='button' aria-controls={disclosure.id}>
        Main field
      </button>
      <DisclosureDetails {...disclosure} legend='Details'>
        <input aria-label='Caption' />
        <input type='hidden' name='bookkeeping' defaultValue='x' />
        <div hidden>
          <select aria-label='Derived' defaultValue='a'>
            <option value='a'>A</option>
          </select>
        </div>
      </DisclosureDetails>
    </>
  )
}

function details() {
  return screen.getByRole('group', { hidden: true })
}

describe('DisclosureDetails', () => {
  it('shows the details only once the main field is revealed', () => {
    const { rerender } = render(<Form isRevealed={false} />)
    expect(details()).not.toBeVisible()
    expect(details()).toHaveClass('disclosure-details')
    expect(details()).toHaveAttribute(
      'id',
      screen.getByRole('button').getAttribute('aria-controls')
    )

    rerender(<Form isRevealed />)
    expect(details()).toBeVisible()
  })

  it('closes with the main field unless kept with content', () => {
    const { rerender } = render(<Form isRevealed />)
    fireEvent.change(screen.getByLabelText('Caption'), {
      target: { value: 'A caption' }
    })

    rerender(<Form isRevealed={false} />)
    expect(details()).not.toBeVisible()
  })

  describe('isKeptWithContent', () => {
    it('stays open after the main field clears if the details have content', () => {
      const { rerender } = render(
        <Form isRevealed isKeptWithContent />
      )
      fireEvent.change(screen.getByLabelText('Caption'), {
        target: { value: 'A caption' }
      })

      rerender(<Form isRevealed={false} isKeptWithContent />)
      expect(details()).toBeVisible()
    })

    it('closes when the main field clears with only hidden values filled', () => {
      const { rerender } = render(
        <Form isRevealed isKeptWithContent />
      )

      rerender(<Form isRevealed={false} isKeptWithContent />)
      expect(details()).not.toBeVisible()
    })

    it('closes once kept details are emptied and left', () => {
      const { rerender } = render(
        <Form isRevealed isKeptWithContent />
      )
      const caption = screen.getByLabelText('Caption')
      fireEvent.change(caption, { target: { value: 'A caption' } })
      rerender(<Form isRevealed={false} isKeptWithContent />)

      fireEvent.change(caption, { target: { value: '' } })
      expect(details()).toBeVisible()
      fireEvent.blur(caption)
      expect(details()).not.toBeVisible()
    })
  })
})
