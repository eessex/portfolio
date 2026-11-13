import NextLink from 'next/link'

import styles from '@/ui/pagination/pagination.module.scss'

/**
 * Numbered pages as `?page=N` links, for tables that don't scroll in.
 * `otherPages` keeps another table's page on the same URL.
 */
export function Pagination({
  page,
  pageCount,
  basePath,
  label = 'Pagination',
  param = 'page',
  otherPages = {},
  fragment
}: {
  page: number
  pageCount: number
  basePath: string
  label?: string
  param?: string
  otherPages?: Record<string, number>
  fragment?: string
}) {
  if (pageCount <= 1) return null
  const href = (n: number) => {
    const params = new URLSearchParams()
    // page 1 is the default, so it stays out of the URL
    for (const [key, value] of Object.entries({
      ...otherPages,
      [param]: n
    })) {
      if (value > 1) params.set(key, String(value))
    }
    const query = params.size > 0 ? `?${params}` : ''
    return `${basePath}${query}${fragment ? `#${fragment}` : ''}`
  }

  return (
    <nav aria-label={label} className={styles['pagination']}>
      {page > 1 ? (
        <NextLink href={href(page - 1)} rel='prev'>
          Previous
        </NextLink>
      ) : (
        <span aria-disabled='true'>Previous</span>
      )}
      <span aria-current='page'>
        Page {page} of {pageCount}
      </span>
      {page < pageCount ? (
        <NextLink href={href(page + 1)} rel='next'>
          Next
        </NextLink>
      ) : (
        <span aria-disabled='true'>Next</span>
      )}
    </nav>
  )
}
