import { notFound } from 'next/navigation'

import { auth } from '@/api/auth'
import ItemLayout, {
  generateItemMetadata,
  generateItemStaticParams
} from '@/app/(item-pages)/item-layout'
import {
  fetchProjectBySlug,
  fetchProjects
} from '@/lib/projects/data'
import type { PageItemProps } from '@/lib/types'

export async function generateMetadata ({ params }: PageItemProps) {
  return generateItemMetadata(params, fetchProjectBySlug)
}

export async function generateStaticParams () {
  return generateItemStaticParams(fetchProjects)
}

export default async function ProjectPage ({ params }: PageItemProps) {
  const [
    { slug },
    session
  ] = await Promise.all([
    params,
    auth()
  ])

  const project = await fetchProjectBySlug(slug, !!session?.user)
  if (!project) return notFound()

  return (
    <ItemLayout item={project} />
  )
}
