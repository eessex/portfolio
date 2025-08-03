import { fetchReleases } from '@/lib/data'
import ReleaseList from '@/ui/release-list/release-list'
import Loading from '@/ui/loading'
import { Metadata } from 'next'
import { Suspense } from 'react'
import { ReleaseClient } from '@/lib/definitions'
import { auth } from '../../auth'

const title = 'Releases'
export const metadata: Metadata = { title }

export default async function ReleasesPage () {
  const session = await auth()
  const releases = await fetchReleases(!!session?.user)

  const featureReleases = releases.filter((release) => release.isFeature)
  const compilations = releases.filter((release) => release.isCompilation)
  const collaborations = releases.filter((release) => release.isCollaboration)
  const singles = releases.filter((release) => release.isSingle)

  const soloReleases = releases.map((release) => ![
    ...featureReleases,
    ...compilations,
    ...collaborations,
    ...singles
  ].includes(release)
    ? release
    : undefined).filter(Boolean) as ReleaseClient[]

  return (
    <div>
      <h1 className='p-4 visually-hidden'>
        {title}
      </h1>

      <Suspense fallback={<Loading />}>
        <div>
          {soloReleases && <ReleaseList title='Solo Releases' releases={soloReleases} />}
          {singles && <ReleaseList title='Singles' releases={singles} />}
          {compilations && <ReleaseList title='Compilations' releases={compilations} />}
          {collaborations && <ReleaseList title='Collaborative Releases' releases={collaborations} />}
          {featureReleases && <ReleaseList title='Featured On' releases={featureReleases} />}
        </div>
      </Suspense>
    </div>
  )
}
