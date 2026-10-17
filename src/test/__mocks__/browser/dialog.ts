const escapeListeners = new WeakMap<
  HTMLDialogElement,
  (event: KeyboardEvent) => void
>()

// jsdom has HTMLDialogElement but no showModal()/close(). Esc fires a
// cancelable `cancel`, closing the dialog unless it's prevented.
export function installDialogMock() {
  HTMLDialogElement.prototype.showModal = function (
    this: HTMLDialogElement
  ) {
    this.setAttribute('open', '')
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      const cancel = new Event('cancel', { cancelable: true })
      if (this.dispatchEvent(cancel)) this.close()
    }
    escapeListeners.set(this, handleKeyDown)
    document.addEventListener('keydown', handleKeyDown)
  }

  HTMLDialogElement.prototype.close = function (
    this: HTMLDialogElement
  ) {
    if (!this.hasAttribute('open')) return
    this.removeAttribute('open')
    const handleKeyDown = escapeListeners.get(this)
    if (handleKeyDown) {
      document.removeEventListener('keydown', handleKeyDown)
    }
    this.dispatchEvent(new Event('close'))
  }
}
