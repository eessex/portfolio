import { useEffect, useState } from 'react'

export const useWindowScrollPosition = () => {
  const [isAtContentTop, setIsAtContentTop] = useState(true)
  const [isScrollingDown, setIsScrollingDown] = useState(false)

  useEffect(() => {
    function observeContentTop (target: HTMLElement | null = null) {
      if (!target) {
        console.warn('No target element found for scroll position observer')
        return
      }
      const observer = new IntersectionObserver(
        ([entry]) => {
          const atTop = entry.boundingClientRect.top > 0
          if (atTop !== isAtContentTop) {
            setIsAtContentTop(atTop)
          }
        },
        {
          threshold: 0
        }
      )
      observer.observe(target)
      return observer
    }

    const observer = observeContentTop(document.getElementById('content'))

    let lastScrollY = window.scrollY
    let scrollTimeout: number | null = null
    const onScroll = () => {
      if (scrollTimeout !== null) return
      scrollTimeout = window.requestAnimationFrame(() => {
        const currentScrollY = window.scrollY
        const scrollingDown = currentScrollY > lastScrollY
        if (isScrollingDown !== scrollingDown) {
          setIsScrollingDown(scrollingDown)
        }
        lastScrollY = currentScrollY
        scrollTimeout = null
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      const target = document.getElementById('content')
      if (target) {
        observer?.unobserve(target)
      }
      observer?.disconnect()

      window.removeEventListener('scroll', onScroll)
    }
  }, [isAtContentTop, isScrollingDown])
  return {
    isAtContentTop,
    isScrollingDown
  }
}
