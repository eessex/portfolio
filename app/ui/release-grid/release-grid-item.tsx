import type { ReleaseClient } from '@/lib/definitions'
import { DraftBadge } from '@/ui/draft-badge'
import { formattedDateTime, releaseUrl } from '@/ui/util'
import Link from 'next/link'

export function ReleaseGridItem ({
  release,
  index
}: {
  release: ReleaseClient;
  index: number;
}) {
  return (
    <article>
      {release.images && release.images[0].url && (
        <figure style={{ aspectRatio: release.images[0].aspect }}>
          <Link href={releaseUrl(release.slug)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={release.images[0].url}
              alt={release.images[0].caption || `Cover artwork for ${release.title}`}
              style={{ aspectRatio: release.images[0].aspect }}
              loading={index > 8 ? 'lazy' : undefined}
              title={release.images[0].caption || undefined}
            />
          </Link>
        </figure>
      )}
      <section>
        <Link href={releaseUrl(release.slug)}>
          <h3>
            {release.artist}: {release.title}
          </h3>

          {!release.isPublished && <DraftBadge />}

          <h4>
            {`${release.format}, `}
            {release.label && `${release.label}`}
            <br />{formattedDateTime(release.releaseDate, 'xs')}
          </h4>
        </Link>
      </section>
    </article>
  )
}
