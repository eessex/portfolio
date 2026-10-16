import type { Link } from '@/lib/links/schemas/db'
import { formattedDateOrTimestamp } from '@/ui/util'

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
        <div>
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
              <b>{link.title || link.url}</b>
              <div>
                {link.attribution && (
                  <span>{link.attribution}, </span>
                )}
                {formattedDateOrTimestamp(
                  link.publishDate,
                  link.createdAt!,
                  'xs'
                )}
              </div>
            </>
          )}
        </div>
      ) : (
        <>{link.title || link.url}</>
      )}
    </a>
  )
}
