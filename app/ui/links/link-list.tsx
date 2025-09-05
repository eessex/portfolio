import type { Link } from '@/lib/definitions'
import { LinkItem } from '@/ui/links//link-item'
import styles from '@/ui/links/links.module.scss'
import { clsx } from 'clsx'

export function LinksList ({ links }: { links: Link[] }) {
  if (!links || links.length === 0) return null

  return (
    <ul className={styles['links-list']}>
      {links?.map((link, index) => (
        <li key={index}>
          <LinkItem link={link} className={clsx(link.type === 'press' && styles['press-link'])} />
        </li>
      ))}
    </ul>
  )
}
