import styles from '@/app/(item-pages)/edit-page-layout.module.scss'

/**
 * An edit or new page: its title as a minimal header, in the left
 * gutter on wide screens with the form level with it, like `/about`.
 */
export function EditPageLayout({
  title,
  children
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <article className={styles['edit-page']}>
      <header>
        <h1>{title}</h1>
      </header>

      {children}
    </article>
  )
}
