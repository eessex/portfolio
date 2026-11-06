import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState
} from 'react'

import { useWindowScrollPosition } from '@/ui/nav/scroll-position'

/**
 * Open state and dismissal for a menubar button's panel; render
 * `<OnPathnameChange onChange={close} />` to close on navigation
 */
export function useMenubarDisclosure() {
  const [isOpen, setIsOpen] = useState(false)
  const close = useCallback(() => setIsOpen(false), [])
  const { isAtContentTop, isScrollingDown } =
    useWindowScrollPosition()
  // same condition that slides the menubar away
  const isMenubarHidden = isScrollingDown && !isAtContentTop
  if (isOpen && isMenubarHidden) {
    setIsOpen(false)
  }
  const panelId = useId()
  const containerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!isOpen) return

    function onPointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node))
        setIsOpen(false)
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape' || event.defaultPrevented) return
      // leave Escape to whatever else has focus
      const { activeElement } = document
      if (
        activeElement !== document.body &&
        !containerRef.current?.contains(activeElement)
      )
        return
      setIsOpen(false)
      buttonRef.current?.focus()
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [isOpen])

  return {
    isOpen,
    close,
    panelId,
    containerProps: {
      ref: containerRef,
      onBlur: (event: React.FocusEvent) => {
        // tabbing out closes it; null = focus left the page
        const next = event.relatedTarget as Node | null
        if (next && !containerRef.current?.contains(next))
          setIsOpen(false)
      }
    },
    buttonProps: {
      ref: buttonRef,
      type: 'button' as const,
      'aria-expanded': isOpen,
      'aria-controls': panelId,
      onClick: () => setIsOpen(!isOpen)
    },
    panelProps: {
      id: panelId,
      onClick: (event: React.MouseEvent) => {
        // a link to the current page doesn't change the pathname
        if ((event.target as Element).closest('a')) setIsOpen(false)
      }
    }
  }
}
