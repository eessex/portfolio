import type { Metadata } from 'next'

import { resolveEditItemId } from '@/app/(item-pages)/resolve-page-item'
import type { PagePath } from '@/lib/schemas'
import type { PageItemProps } from '@/lib/types'

/** An edit page's heading and tab title: `Edit Project: Das Audit` */
export function editItemTitle(
  title: string,
  item: { title: string }
) {
  return `${title}: ${item.title}`
}

export async function generateEditItemMetadata(
  params: PageItemProps['params'],
  pagePath: PagePath,
  fetchById: (
    id: string,
    isAuthed: boolean
  ) => Promise<{ title: string } | undefined>,
  title: string
): Promise<Metadata> {
  const { slug } = await params
  const id = await resolveEditItemId(pagePath, slug)
  const item = await fetchById(id, true)

  return { title: item ? editItemTitle(title, item) : title }
}
