import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { SortableList } from '@/ui/drag-and-drop/sortable-list'

interface TestItem {
  id: string
  label: string
}

const items: TestItem[] = [
  { id: 'a', label: 'Alpha' },
  { id: 'b', label: 'Beta' },
  { id: 'c', label: 'Gamma' }
]

function renderList(onReorder = jest.fn()) {
  render(
    <SortableList<TestItem>
      items={items}
      onReorder={onReorder}
      renderItem={(item, _index, dragHandle) => (
        <div>
          {dragHandle}
          <span>{item.label}</span>
        </div>
      )}
    />
  )
  return onReorder
}

describe('SortableList', () => {
  it('renders items in order', () => {
    renderList()

    const labels = screen.getAllByText(/Alpha|Beta|Gamma/)
    expect(labels.map((el) => el.textContent)).toEqual([
      'Alpha',
      'Beta',
      'Gamma'
    ])
  })

  it('disables move-up on the first item and move-down on the last', () => {
    renderList()

    const moveUpButtons = screen.getAllByRole('button', {
      name: 'Move up'
    })
    const moveDownButtons = screen.getAllByRole('button', {
      name: 'Move down'
    })

    expect(moveUpButtons[0]).toBeDisabled()
    expect(moveUpButtons[1]).not.toBeDisabled()
    expect(moveUpButtons[2]).not.toBeDisabled()

    expect(moveDownButtons[0]).not.toBeDisabled()
    expect(moveDownButtons[1]).not.toBeDisabled()
    expect(moveDownButtons[2]).toBeDisabled()
  })

  it('moves an item down when its move-down button is clicked', async () => {
    const user = userEvent.setup()
    const onReorder = renderList()

    const moveDownButtons = screen.getAllByRole('button', {
      name: 'Move down'
    })
    await user.click(moveDownButtons[0])

    expect(onReorder).toHaveBeenCalledWith([
      { id: 'b', label: 'Beta' },
      { id: 'a', label: 'Alpha' },
      { id: 'c', label: 'Gamma' }
    ])
  })

  it('moves an item up when its move-up button is clicked', async () => {
    const user = userEvent.setup()
    const onReorder = renderList()

    const moveUpButtons = screen.getAllByRole('button', {
      name: 'Move up'
    })
    await user.click(moveUpButtons[2])

    expect(onReorder).toHaveBeenCalledWith([
      { id: 'a', label: 'Alpha' },
      { id: 'c', label: 'Gamma' },
      { id: 'b', label: 'Beta' }
    ])
  })

  it('renders a drag handle for each item', () => {
    renderList()

    expect(
      screen.getAllByRole('button', { name: 'Drag to reorder' })
    ).toHaveLength(3)
  })
})
