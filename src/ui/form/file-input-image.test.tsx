import {
  fireEvent,
  render,
  screen,
  waitFor
} from '@testing-library/react'

import { mockFile } from '@/test/helpers'
import {
  FileInputImage,
  MAX_UPLOAD_FILE_SIZE
} from '@/ui/form/file-input-image'

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

class LoadingImage {
  onload: (() => void) | null = null
  onerror: (() => void) | null = null
  naturalWidth = 800
  naturalHeight = 600

  set src(_value: string) {
    queueMicrotask(() => this.onload?.())
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

  it('rejects a file over the size limit without previewing it', async () => {
    ;(URL.createObjectURL as jest.Mock).mockClear()
    const onChange = jest.fn()

    render(
      <FileInputImage label='Upload new image' onChange={onChange} />
    )
    const fileInput = screen.getByLabelText(/upload new image/i)

    fireEvent.change(fileInput, {
      target: {
        files: [mockFile('huge.jpg', MAX_UPLOAD_FILE_SIZE + 1)]
      }
    })

    expect(screen.getByText(/too large/i)).toBeInTheDocument()
    expect(URL.createObjectURL).not.toHaveBeenCalled()
    expect(fileInput).not.toHaveAttribute('hidden')
    expect(fileInput).toBeRequired()
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

  it('clears the file input filename when the preview is removed', async () => {
    global.Image = LoadingImage as unknown as typeof Image

    render(<FileInputImage label='Upload new image' />)
    const fileInput = screen.getByLabelText(/upload new image/i)
    const setValue = jest.fn()
    Object.defineProperty(fileInput, 'value', {
      configurable: true,
      get: () => '',
      set: setValue
    })

    fireEvent.change(fileInput, {
      target: { files: [mockFile('evepuffers.jpg')] }
    })

    const removeButton = await screen.findByRole('button', {
      name: /remove image/i
    })
    fireEvent.click(removeButton)

    await waitFor(() => {
      expect(
        screen.queryByRole('button', { name: /remove image/i })
      ).not.toBeInTheDocument()
    })

    expect(setValue).toHaveBeenCalledWith('')
    expect(fileInput).not.toHaveAttribute('hidden')
    expect(fileInput).toBeRequired()
  })

  it('reopens the file picker when the preview is clicked', async () => {
    global.Image = LoadingImage as unknown as typeof Image

    render(<FileInputImage label='Upload new image' />)
    const fileInput = screen.getByLabelText(
      /upload new image/i
    ) as HTMLInputElement

    fireEvent.change(fileInput, {
      target: { files: [mockFile('cat.jpg')] }
    })

    const replaceButton = await screen.findByRole('button', {
      name: /replace image/i
    })
    const clickSpy = jest
      .spyOn(fileInput, 'click')
      .mockImplementation(() => {})
    fireEvent.click(replaceButton)
    expect(clickSpy).toHaveBeenCalledTimes(1)
    clickSpy.mockRestore()
  })

  it('does not mark the input required when the caller opts out', () => {
    render(
      <FileInputImage
        label='Upload new image'
        attributes={{ required: false }}
      />
    )

    expect(
      screen.getByLabelText(/upload new image/i)
    ).not.toBeRequired()
  })
})
