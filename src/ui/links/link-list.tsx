import { clsx } from 'clsx'
import { useId } from 'react'

import type { Link } from '@/lib/links/schemas/db'
import { pressLinksFirst } from '@/lib/links/util'
import { LinkItem } from '@/ui/links//link-item'
import styles from '@/ui/links/links.module.scss'

export function LinksList({
  links,
  isPress,
  className
}: {
  links: Link[]
  isPress?: boolean
  className?: string
}) {
  const sectionId = useId()
  if (!links || links.length === 0) return null

  return (
    <section className={className} aria-labelledby={sectionId}>
      <h2 id={sectionId} className='visually-hidden'>
        {isPress ? 'Press Links' : 'Links'}
      </h2>
      <ul className={styles['links-list']}>
        {pressLinksFirst(links).map((link, index) => (
          <li key={index}>
            <LinkItem
              link={link}
              className={clsx(
                link.type === 'press' && styles['press-link']
              )}
            />
          </li>
        ))}
      </ul>
    </section>
  )
}
