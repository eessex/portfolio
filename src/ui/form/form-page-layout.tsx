import styles from '@/ui/form/form-page-layout.module.scss'

/**
 * A single-form page (edit/new pages, `/about/edit`): its title as a
 * minimal header, in the left gutter on wide screens with the form
 * level with it, like `/about`.
 */
export function FormPageLayout({
  title,
  children
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <article className={styles['form-page']}>
      <header>
        <h1>{title}</h1>
      </header>

      {children}
    </article>
  )
}
