import { ReleaseClient } from '@/lib/definitions'
import { formattedDateTime } from '@/ui/util'

import Link from 'next/link'

export default function ReleaseGridItem ({
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
          <Link href={`/release/${release.slug}`}>
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
        <Link href={`/release/${release.slug}`}>

          <h3>
            {release.artist}: {release.title}
          </h3>

          <h4>
            {`${release.format}, `}
            {release.label && `${release.label}, `}
            {formattedDateTime(release.releaseDate, 'xs')}
          </h4>

        </Link>
        {release.buyLink && (
          <a className='button' href={release.buyLink} target='_blank' rel='noreferrer'>
            Bandcamp
          </a>
        )}
      </section>
    </article>
  )
}
