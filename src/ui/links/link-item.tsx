import { ArrowUpRightIcon } from '@heroicons/react/16/solid'

import type { Link } from '@/lib/links/schemas/db'
import { formattedDateOrTimestamp } from '@/ui/format/dates'

export function LinkItem({
  link,
  className
}: {
  link: Link
  className?: string
}) {
  return (
    <a
      href={link.url}
      target='_blank'
      rel='noopener noreferrer'
      className={className}
    >
      {link.type === 'press' ? (
        <>
          {link.quotation ? (
            <>
              <blockquote cite={link.url}>
                {link.quotation}
              </blockquote>
              <cite>
                {link.attribution && (
                  <>
                    {link.title ? `— ${link.title} in ` : '— '}
                    {link.attribution},{' '}
                  </>
                )}
                <span>
                  {formattedDateOrTimestamp(
                    link.publishDate,
                    link.createdAt!,
                    'xs'
                  )}
                </span>
              </cite>
            </>
          ) : (
            <>
              <b>{link.attribution}</b>
              <span>{link.title || link.url}</span>
              <span>
                {formattedDateOrTimestamp(
                  link.publishDate,
                  link.createdAt!,
                  'xs'
                )}{' '}
                <ArrowUpRightIcon aria-hidden='true' />
              </span>
            </>
          )}
        </>
      ) : (
        <>{link.title || link.url}</>
      )}
    </a>
  )
}
