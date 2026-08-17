import {
  fireEvent,
  render,
  screen,
  waitFor
} from '@testing-library/react'

import { mockFile } from '@/test/helpers'
import { FileInputImage } from '@/ui/form/file-input-image'

URL.createObjectURL = jest.fn(() => 'blob:mock-preview')
URL.revokeObjectURL = jest.fn()

class FailingImage {
  onload: (() => void) | null = null
  onerror: (() => void) | null = null
  naturalWidth = 0
  naturalHeight = 0

  set src(_value: string) {
    // Simulate a file the browser can't decode (real browsers fire
    // this asynchronously, so a microtask is enough to match that).
    queueMicrotask(() => this.onerror?.())
  }
}

describe('FileInputImage', () => {
  const originalImage = global.Image

  afterEach(() => {
    global.Image = originalImage
  })

  it('falls back to the file input with an error when the image fails to load', async () => {
    global.Image = FailingImage as unknown as typeof Image
    const onChange = jest.fn()

    render(
      <FileInputImage label='Upload new image' onChange={onChange} />
    )

    fireEvent.change(screen.getByLabelText(/upload new image/i), {
      target: { files: [mockFile('corrupt.jpg')] }
    })

    await waitFor(() => {
      expect(
        screen.getByText(/couldn.t be loaded as an image/i)
      ).toBeInTheDocument()
    })

    const fileInput = screen.getByLabelText(/upload new image/i)
    expect(fileInput).not.toHaveAttribute('hidden')
    expect(fileInput).toBeRequired()
    expect(
      screen.queryByTitle('Uploaded image preview')
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /remove image/i })
    ).not.toBeInTheDocument()
    expect(onChange).toHaveBeenCalledWith('', undefined, true)
  })

  it('clears a previous load error once a new file is chosen', async () => {
    global.Image = FailingImage as unknown as typeof Image

    render(<FileInputImage label='Upload new image' />)
    const fileInput = screen.getByLabelText(/upload new image/i)

    fireEvent.change(fileInput, {
      target: { files: [mockFile('corrupt.jpg')] }
    })
    await waitFor(() => {
      expect(
        screen.getByText(/couldn.t be loaded as an image/i)
      ).toBeInTheDocument()
    })

    fireEvent.change(fileInput, { target: { files: [] } })

    expect(
      screen.queryByText(/couldn.t be loaded as an image/i)
    ).not.toBeInTheDocument()
  })
})
