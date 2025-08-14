import { formattedDateTime } from '@/ui/util'
import type { Link } from '@/lib/definitions'

export function LinkItem ({ link, className }: { link: Link, className?: string }) {
  return (
    <a href={link.url} target='_blank' rel='noopener noreferrer' className={className}>

      {link.isPress
        ? (
          <div>
            {link.quotation
              ? (
                <>
                  <blockquote cite={link.url}>{link.quotation}</blockquote>
                  <cite>
                    {link.attribution && (
                      <>{link.title ? `— ${link.title} in ` : '— '}{link.attribution}, </>
                    )}
                    {formattedDateTime(link.publishedDate || link.createdAt!, 'xs')}
                  </cite>
                </>
                )
              : (
                <>
                  <b>{link.title || link.url}</b>
                  <div>
                    {link.attribution && (<em>— {link.attribution}, </em>)}
                    {formattedDateTime(link.publishedDate || link.createdAt!, 'xs')}
                  </div>
                </>
                )}
          </div>
          )
        : (
          <>
            {link.title || link.url}
          </>
          )}
    </a>
  )
}
