import { LinkIcon } from '@heroicons/react/24/outline'
import { clsx } from 'clsx'
import { useId } from 'react'

import type { Link } from '@/lib/links/schemas/db'
import { linkOrderGroup, pressLinksFirst } from '@/lib/links/util'
import { LinkItem } from '@/ui/links/link-item'
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

  const sorted = pressLinksFirst(links)
  const press = sorted.filter((link) => linkOrderGroup(link) === 0)
  const quotes = press.filter((link) => link.quotation)
  const pressRows = press.filter((link) => !link.quotation)
  const plainLinks = sorted.slice(press.length)

  return (
    <section className={className} aria-labelledby={sectionId}>
      <h2 id={sectionId} className='visually-hidden'>
        {isPress ? 'Press Links' : 'Links'}
      </h2>
      {quotes.length > 0 && (
        <ul className={styles.quotes}>
          {quotes.map((link) => (
            <li key={link.id}>
              <LinkItem
                link={link}
                className={styles['press-link']}
              />
            </li>
          ))}
        </ul>
      )}
      {pressRows.length > 0 && (
        <ul className={styles['press-rows']}>
          {pressRows.map((link) => (
            <li key={link.id}>
              <LinkItem link={link} className={styles['press-row']} />
            </li>
          ))}
        </ul>
      )}
      {plainLinks.length > 0 && (
        <ul
          className={clsx(
            styles['plain-links'],
            press.length > 0 && styles['after-press']
          )}
        >
          {plainLinks.map((link) => (
            <li key={link.id}>
              <a
                href={link.url}
                target='_blank'
                rel='noopener noreferrer'
                className='button-outline button-sm'
              >
                <LinkIcon aria-hidden='true' />
                {link.title || link.url}
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
