import NextLink from 'next/link'

import styles from '@/ui/pagination/pagination.module.scss'

/** Numbered pages as `?page=N` links, for tables that don't scroll in */
export function Pagination({
  page,
  pageCount,
  basePath,
  label = 'Pagination'
}: {
  page: number
  pageCount: number
  basePath: string
  label?: string
}) {
  if (pageCount <= 1) return null
  const href = (n: number) =>
    n === 1 ? basePath : `${basePath}?page=${n}`

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
