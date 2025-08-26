'use client'

import type { ReleaseClient } from '@/lib/definitions'
import { ReleaseGrid } from '@/ui/release-grid/release-grid'
import { ReleaseList } from '@/ui/release-list/release-list'
import { useState } from 'react'

export function ReleaseLists ({
  releases
}: {
  releases: ReleaseClient[]
}) {
  const [isExpanded, setIsExpanded] = useState(false)
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

  function list ({ title, releases, isExpanded, onExpand }: {
    title: string;
    releases: ReleaseClient[];
    isExpanded?: boolean;
    onExpand?: () => void;
  }) {
    return (
      <>
        {isExpanded
          ? <ReleaseGrid releases={releases} title={title} isExpanded={isExpanded} onExpand={onExpand} />
          : <ReleaseList releases={releases} title={title} isExpanded={isExpanded} onExpand={onExpand} />}
      </>
    )
  }

  return (
    <div>
      {soloReleases && list({ title: 'Solo Releases', releases: soloReleases, isExpanded, onExpand: () => setIsExpanded(!isExpanded) })}
      {singles && list({ title: 'Singles', releases: singles, isExpanded })}
      {compilations && list({ title: 'Compilations', releases: compilations, isExpanded })}
      {collaborations && list({ title: 'Collaborative Releases', releases: collaborations, isExpanded })}
      {featureReleases && list({ title: 'Featured On', releases: featureReleases, isExpanded })}
    </div>
  )
}
