import { fireEvent, render, screen } from '@testing-library/react'

import { withCoverImageUrls } from '@/lib/embed-codes/cover-image-url'
import { embedCodeFixture } from '@/lib/embed-codes/fixtures'
import {
  formatEmbedCodeResult,
  formatNewEmbedCodeSummary
} from '@/ui/embed-codes/format-embed-code-result'

const embedCodeWithCoverImage = withCoverImageUrls(embedCodeFixture)

describe('formatEmbedCodeResult', () => {
  it('renders the title and host', () => {
    render(formatEmbedCodeResult(embedCodeWithCoverImage))

    expect(
      screen.getByText(embedCodeFixture.title!)
    ).toBeInTheDocument()
    expect(
      screen.getByText(embedCodeFixture.host)
    ).toBeInTheDocument()
  })

  it('falls back to Untitled when there is no title', () => {
    render(
      formatEmbedCodeResult({
        ...embedCodeWithCoverImage,
        title: undefined
      })
    )

    expect(screen.getByText('Untitled')).toBeInTheDocument()
  })

  it('renders a cover image thumbnail when coverImageThumbnailUrl is set', () => {
    render(formatEmbedCodeResult(embedCodeWithCoverImage))

    expect(screen.getByRole('img')).toBeInTheDocument()
  })

  it('falls back to the full-size cover image when only coverImageUrl is set', () => {
    render(
      formatEmbedCodeResult({
        ...embedCodeWithCoverImage,
        coverImageThumbnailUrl: undefined
      })
    )

    expect(screen.getByRole('img')).toBeInTheDocument()
  })

  it('renders no thumbnail when neither cover image field is set', () => {
    render(
      formatEmbedCodeResult({
        ...embedCodeWithCoverImage,
        coverImageThumbnailUrl: undefined,
        coverImageUrl: undefined
      })
    )

    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('renders a Video badge for video embed codes', () => {
    render(formatEmbedCodeResult(embedCodeWithCoverImage))

    expect(screen.getByText('Video')).toBeInTheDocument()
  })
})

describe('formatNewEmbedCodeSummary', () => {
  const onEdit = jest.fn()
  const actions = {
    editButton: <button onClick={onEdit}>Edit</button>,
    onRemove: jest.fn(),
    removeLabel: 'Remove embed code'
  }
  const data = {
    host: 'youtube',
    type: 'video',
    previewTitle: 'Resolved video title',
    previewThumbnailUrl:
      'https://img.youtube.com/vi/abc/hqdefault.jpg'
  }

  beforeEach(() => jest.clearAllMocks())

  it('renders the resolved title and host from the slot data', () => {
    render(formatNewEmbedCodeSummary(data, undefined, actions))

    expect(
      screen.getByText('Resolved video title')
    ).toBeInTheDocument()
    expect(screen.getByText('youtube')).toBeInTheDocument()
  })

  it('renders the resolved thumbnail as a raw img', () => {
    render(formatNewEmbedCodeSummary(data, undefined, actions))

    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('src', data.previewThumbnailUrl)
    expect(img).toHaveAttribute('alt', 'Resolved video title')
  })

  it('renders a badge from the collected type/contentType', () => {
    render(formatNewEmbedCodeSummary(data, undefined, actions))

    expect(screen.getByText('Video')).toBeInTheDocument()
  })

  it('falls back to a generic label with no resolved title', () => {
    render(
      formatNewEmbedCodeSummary(
        { host: 'youtube', type: 'video' },
        undefined,
        actions
      )
    )

    expect(screen.getByText('New embed code')).toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('renders the Edit button and wires Remove', () => {
    render(formatNewEmbedCodeSummary(data, undefined, actions))

    fireEvent.click(screen.getByRole('button', { name: 'Edit' }))
    expect(onEdit).toHaveBeenCalled()

    fireEvent.click(
      screen.getByRole('button', { name: 'Remove embed code' })
    )
    expect(actions.onRemove).toHaveBeenCalled()
  })
})
