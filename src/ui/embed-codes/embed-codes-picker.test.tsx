import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { embedCodeFixture } from '@/lib/embed-codes/fixtures'
import { previewEmbedCodeMetadata } from '@/lib/embed-codes/preview-metadata'
import { EmbedCodesPicker } from '@/ui/embed-codes/embed-codes-picker'
import { useToast } from '@/ui/toast/toast-context'

jest.mock('@/ui/toast/toast-context', () => ({ useToast: jest.fn() }))
jest.mock('@/lib/embed-codes/preview-metadata', () => ({
  previewEmbedCodeMetadata: jest.fn()
}))

describe('EmbedCodesPicker', () => {
  beforeEach(() => {
    ;(useToast as jest.Mock).mockReturnValue({
      addErrorMessage: jest.fn(),
      addSuccessMessage: jest.fn(),
      removeMessage: jest.fn()
    })
    ;(previewEmbedCodeMetadata as jest.Mock).mockResolvedValue({})
    fetchMock.resetMocks()
    fetchMock.mockResponse(
      JSON.stringify({ res: [], nextCursor: null, totalCount: 0 })
    )
  })

  afterEach(async () => {
    await act(async () => {
      await Promise.resolve()
    })
  })

  it('shows an error when an edited embed code is saved with its iframe removed', async () => {
    const user = userEvent.setup()
    render(<EmbedCodesPicker embedCodes={[embedCodeFixture]} />)

    await user.click(screen.getByRole('button', { name: /^edit$/i }))
    await user.click(
      screen.getByRole('button', { name: /remove embed/i })
    )
    await user.click(
      screen.getByRole('button', { name: /save embed code/i })
    )

    // left open, blocked on the missing iframe
    const input =
      screen.getByLabelText<HTMLInputElement>(/iframe code/i)
    expect(input).toBeVisible()
    expect(input).toBeRequired()
    expect(input).toBeInvalid()
    expect(
      screen.queryByRole('button', { name: /^edit$/i })
    ).not.toBeInTheDocument()
  })
})
