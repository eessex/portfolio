import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'

import { Dialog } from '@/ui/dialog/dialog'

function DialogOpener({ onClose }: { onClose?: () => void }) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <>
      <button type='button' onClick={() => setIsOpen(true)}>
        Open
      </button>
      {isOpen && (
        <Dialog
          title='Delete project?'
          cancelButtonText='Cancel'
          confirmButtonText='Confirm'
          onConfirm={jest.fn()}
          onClose={() => {
            onClose?.()
            setIsOpen(false)
          }}
        >
          <p>This can&apos;t be undone.</p>
        </Dialog>
      )}
    </>
  )
}

function open() {
  const opener = screen.getByRole('button', { name: 'Open' })
  opener.focus()
  fireEvent.click(opener)
  return opener
}

describe('Dialog', () => {
  it('opens as a modal labelled by its title, focusing Cancel', () => {
    render(<DialogOpener />)
    open()

    const dialog = screen.getByRole('dialog', {
      name: 'Delete project?'
    })
    expect(dialog.tagName).toBe('DIALOG')
    expect(dialog).toHaveAttribute('open')
    expect(
      screen.getByRole('button', { name: 'Cancel' })
    ).toHaveFocus()
  })

  it('locks page scroll while open', () => {
    render(<DialogOpener />)
    open()
    expect(document.body.style.overflow).toBe('hidden')

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(document.body.style.overflow).toBe('')
  })

  it('closes on Escape and returns focus to the opener', () => {
    const onClose = jest.fn()
    render(<DialogOpener onClose={onClose} />)
    const opener = open()

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(onClose).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(opener).toHaveFocus()
  })
})
