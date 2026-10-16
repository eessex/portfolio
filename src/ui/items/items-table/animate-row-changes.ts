const DURATION_MS = 200
// how much of the way back to its old spot a card starts; a wrap can
// cross the whole row, so the full distance reads as a big swoop
const TRAVEL = 0.1

type Position = { left: number; top: number; row: number }

/**
 * Ref callback for a wrapping flex container (the justified
 * `/projects` rows): when its width changes and a child lands in a
 * different row, it fades in drifting from the direction of its old
 * spot instead of jumping. Cards still resize live; only row changes
 * animate, and only on width changes, so new content (drafts, load
 * more) doesn't.
 * Module-level so its identity is stable across renders.
 */
export function animateRowChanges(container: HTMLElement | null) {
  if (!container || typeof ResizeObserver === 'undefined') return

  let width = container.clientWidth
  let positions = measure(container)

  const observer = new ResizeObserver(() => {
    const previous = positions
    positions = measure(container)

    if (container.clientWidth === width) return
    width = container.clientWidth

    if (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return
    }

    for (const [el, position] of positions) {
      const before = previous.get(el)
      if (!before || before.row === position.row) continue

      const dx = (before.left - position.left) * TRAVEL
      const dy = (before.top - position.top) * TRAVEL
      el.getAnimations().forEach((animation) => animation.cancel())
      el.animate(
        [
          {
            transform: `translate(${dx}px, ${dy}px)`,
            opacity: 0.7
          },
          { transform: 'none', opacity: 1 }
        ],
        {
          duration: DURATION_MS,
          easing: 'cubic-bezier(0.2, 0, 0, 1)'
        }
      )
    }
  })

  observer.observe(container)
  return () => observer.disconnect()
}

// offsets, not client rects, so a running animation's transform
// doesn't count as the card's position
function measure(container: HTMLElement) {
  const positions = new Map<HTMLElement, Position>()
  const rowTops: number[] = []

  for (const el of container.children) {
    if (!(el instanceof HTMLElement)) continue
    if (rowTops.at(-1) !== el.offsetTop) rowTops.push(el.offsetTop)
    positions.set(el, {
      left: el.offsetLeft,
      top: el.offsetTop,
      row: rowTops.length - 1
    })
  }

  return positions
}
