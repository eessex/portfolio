'use client'

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  ArrowDownIcon,
  ArrowUpIcon,
  Bars2Icon
} from '@heroicons/react/24/outline'
import { useId } from 'react'

import styles from '@/ui/drag-and-drop/sortable-list.module.scss'

export interface SortableListProps<T extends { id: string }> {
  items: T[]
  onReorder: (items: T[]) => void
  /**
   * `dragHandle` is a ready-made button (icon + drag listeners) for
   * the caller to place wherever suits its own item layout, e.g.
   * inside a bordered/backgrounded chip alongside a remove button,
   * rather than always rendering outside the item's content.
   */
  renderItem: (
    item: T,
    index: number,
    dragHandle: React.ReactNode
  ) => React.ReactNode
  className?: string
  /**
   * `false` keeps two adjacent items from trading places, e.g. across
   * a boundary the caller enforces (which would otherwise snap
   * straight back): the move-up/move-down button between them is
   * disabled, and an item with no swappable neighbour gets no
   * drag/move controls at all.
   */
  isSwappable?: (a: T, b: T) => boolean
}

/**
 * A generic pointer/touch/keyboard-draggable list, with explicit
 * move-up/move-down buttons alongside the drag handle as a
 * discoverable, non-pointer-dependent way to reorder (screen readers,
 * keyboard-only use). `T` just needs a stable `id` — this has no
 * knowledge of what it's a list of.
 */
export function SortableList<T extends { id: string }>({
  items,
  onReorder,
  renderItem,
  className,
  isSwappable = () => true
}: SortableListProps<T>) {
  const dndId = useId()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = items.findIndex((item) => item.id === active.id)
    const newIndex = items.findIndex((item) => item.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    onReorder(arrayMove(items, oldIndex, newIndex))
  }

  return (
    <DndContext
      id={dndId}
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map((item) => item.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className={className}>
          {items.map((item, index) => {
            const isMovableUp =
              index > 0 && isSwappable(items[index - 1], item)
            const isMovableDown =
              index < items.length - 1 &&
              isSwappable(item, items[index + 1])
            return (
              <SortableListItem
                key={item.id}
                id={item.id}
                isSortable={isMovableUp || isMovableDown}
                isMovableUp={isMovableUp}
                isMovableDown={isMovableDown}
                onMoveUp={() =>
                  onReorder(arrayMove(items, index, index - 1))
                }
                onMoveDown={() =>
                  onReorder(arrayMove(items, index, index + 1))
                }
                render={(dragHandle) =>
                  renderItem(item, index, dragHandle)
                }
              />
            )
          })}
        </div>
      </SortableContext>
    </DndContext>
  )
}

function SortableListItem({
  id,
  isSortable,
  isMovableUp,
  isMovableDown,
  onMoveUp,
  onMoveDown,
  render
}: {
  id: string
  isSortable: boolean
  isMovableUp: boolean
  isMovableDown: boolean
  onMoveUp: () => void
  onMoveDown: () => void
  render: (dragHandle: React.ReactNode) => React.ReactNode
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id, disabled: !isSortable })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }

  const dragHandle = isSortable && (
    <button
      type='button'
      className={styles['drag-handle']}
      aria-label='Drag to reorder'
      {...attributes}
      {...listeners}
    >
      <Bars2Icon />
    </button>
  )

  return (
    <div ref={setNodeRef} style={style}>
      {render(dragHandle)}
      {isSortable && (
        <>
          <button
            type='button'
            className={`${styles['move-button']} visually-hidden`}
            aria-label='Move up'
            disabled={!isMovableUp}
            onClick={onMoveUp}
          >
            <ArrowUpIcon />
          </button>
          <button
            type='button'
            className={`${styles['move-button']} visually-hidden`}
            aria-label='Move down'
            disabled={!isMovableDown}
            onClick={onMoveDown}
          >
            <ArrowDownIcon />
          </button>
        </>
      )}
    </div>
  )
}
