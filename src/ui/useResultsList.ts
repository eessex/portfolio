import {
  useEffect,
  useRef,
  useState
} from 'react'

import type { ResponseWithCursor } from '@/lib/util'

export function useResultsList<T> (
  apiEndpoint: string,
  res: ResponseWithCursor<T>
) {
  const [count, setCount] = useState(res.totalCount)
  const [isLoading, setIsLoading] = useState(false)
  const [initialResultsCache, _setInitialResultsCache] = useState<T[]>(res.res)
  const [items, setItems] = useState<T[]>(initialResultsCache)
  const [nextCursor, setNextCursor] = useState<string | null>(res.nextCursor)
  const totalCount = res.totalCount

  const loadMoreRef = useRef<HTMLLIElement>(null)

  useEffect(() => {
    async function loadMore () {
      if (!isLoading && nextCursor) {
        setIsLoading(true)

        try {
          const safeCursor = encodeURIComponent(nextCursor)
          const res = await fetch(`${apiEndpoint}?cursor=${safeCursor}`)
          const data: ResponseWithCursor<T> = await res.json()

          setItems((prevItems) => [...prevItems, ...data.res])
          setNextCursor(data.nextCursor)
          setCount(data.totalCount)
        } catch (error) {
          console.error('Error fetching more items:', error)
        } finally {
          setIsLoading(false)
        }
      }
    }

    const node = loadMoreRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      async (entries) => {
        if (entries[0].isIntersecting && !isLoading) {
          await loadMore()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(node)

    return () => {
      observer.disconnect()
    }
  }, [apiEndpoint, isLoading, nextCursor])

  return {
    count,
    isLoading,
    items,
    loadMoreRef,
    nextCursor,
    totalCount
  }
}
