import styles from '@/ui/form/form-page-layout.module.scss'

/**
 * A single-form page (edit/new pages, `/login`): its title as a
 * minimal header, in the left gutter on wide screens with the form
 * level with it, like `/about`. `note` is a line centered under the
 * form.
 */
export function FormPageLayout({
  title,
  note,
  children
}: {
  title: string
  note?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <article className={styles['form-page']}>
      <header>
        <h1>{title}</h1>
      </header>

      {children}

      {note && <p className={styles.note}>{note}</p>}
    </article>
  )
}
