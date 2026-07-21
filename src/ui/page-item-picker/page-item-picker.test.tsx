import {
  fireEvent,
  render,
  screen,
  waitFor
} from '@testing-library/react'

import type {
  FetchReleasesResult,
  ReleaseClient
} from '@/lib/releases/types'
import { PageItemPicker } from '@/ui/page-item-picker/page-item-picker'
import { useResultsList } from '@/ui/useResultsList'

jest.mock('@/ui/useResultsList')

const releaseFixture = {
  id: 'release-2',
  title: 'Searched Release',
  path: 'releases',
  slug: 'searched-release'
}

function renderReleasePicker(props = {}) {
  return render(
    <PageItemPicker<ReleaseClient, FetchReleasesResult>
      pagePath='releases'
      {...props}
    />
  )
}

describe('PageItemPicker', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    const actual = jest.requireActual('@/ui/useResultsList')
    ;(useResultsList as jest.Mock).mockImplementation(
      actual.useResultsList
    )
    // With no seeded `initialResults`, the combobox fetches its first
    // (grouped) page on mount; resolve it so the update lands in act().
    global.fetch = jest.fn().mockResolvedValue({
      json: async () => ({ res: {}, nextCursor: null, totalCount: 0 })
    })
  })

  describe('initial render', () => {
    it('shows the combobox search input when no item is selected', async () => {
      renderReleasePicker()

      expect(screen.getByRole('combobox')).toBeInTheDocument()
      expect(
        screen.queryByText(/remove release/i)
      ).not.toBeInTheDocument()

      await waitFor(() => expect(global.fetch).toHaveBeenCalled())
    })

    it('shows the currently selected item when initialItem is provided', () => {
      renderReleasePicker({
        initialItem: { id: 'release-1', title: 'Test Release' }
      })

      expect(screen.getByText('Test Release')).toBeInTheDocument()
      const input = screen.getByDisplayValue(
        'release-1'
      ) as HTMLInputElement
      expect(input).toHaveAttribute('name', 'releaseId')
    })
  })

  describe('search mode', () => {
    it('searches and selects an item from the combobox', () => {
      ;(useResultsList as jest.Mock).mockReturnValue({
        query: 'Searched',
        setQuery: jest.fn(),
        items: [releaseFixture],
        isLoading: false,
        nextCursor: null,
        loadMoreRef: jest.fn()
      })

      renderReleasePicker()
      fireEvent.focus(screen.getByRole('combobox'))

      const option = screen.getByText('Searched Release')
      fireEvent.mouseDown(option)

      const releaseIdInput = screen.getByDisplayValue(
        'release-2'
      ) as HTMLInputElement
      expect(releaseIdInput).toHaveAttribute('name', 'releaseId')
      expect(screen.getByText('Searched Release')).toBeInTheDocument()
    })
  })

  describe('selected item state', () => {
    it('allows clearing the selected item, returning to search', async () => {
      renderReleasePicker({
        initialItem: { id: 'release-1', title: 'Test Release' }
      })

      fireEvent.click(
        screen.getByRole('button', { name: /remove release/i })
      )

      expect(
        screen.queryByText('Test Release')
      ).not.toBeInTheDocument()
      expect(screen.getByRole('combobox')).toBeInTheDocument()

      await waitFor(() => expect(global.fetch).toHaveBeenCalled())
    })
  })
})
