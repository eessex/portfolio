import { flushSync } from 'react-dom'

/**
 * Commits a React state update inside a view transition, so the
 * reflow it causes animates instead of jumping. Elements need a
 * `view-transition-name` to morph individually; without support, or
 * with reduced motion, the update applies directly. Resolves once the
 * update has been committed.
 */
export async function withViewTransition(
  update: () => void
): Promise<void> {
  if (
    typeof document === 'undefined' ||
    !('startViewTransition' in document) ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    update()
    return
  }

  // flushSync: the DOM must change inside the callback for the browser
  // to snapshot the new state
  const transition = document.startViewTransition(() =>
    flushSync(update)
  )
  // a newer transition (e.g. another table's) skips this one; the
  // update still applies, so the rejection is expected
  transition.ready.catch(() => {})
  await transition.updateCallbackDone
}
