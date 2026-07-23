'use client'

import { useState } from 'react'

import type { ProjectClient } from '@/lib/projects/types'
import type { ReleaseClient } from '@/lib/releases/types'
import {
  itemTypeToLabel,
  type PagePath,
  pagePathSingulars
} from '@/lib/schemas'
import type { PageDataResponse, PageItemClient } from '@/lib/types'
import { Badges } from '@/ui/badges'
import { Combobox } from '@/ui/combobox/combobox'
import { SelectedResult } from '@/ui/selected-results/selected-result'
import { formattedItemTitle, formattedItemType } from '@/ui/util'

export type SelectedPageItem = Pick<
  PageItemClient,
  'id' | 'title' | 'coverImage'
> & {
  /** Only present for releases/projects; shown as a badge when set. */
  type?: (ReleaseClient | ProjectClient)['type']
}

/**
 * `type` (e.g. album/ep/single) only exists on releases/projects, not
 * events — mirrors the `as ReleaseClient | ProjectClient` cast used
 * for the same field in item-card.tsx/items-table-row.tsx.
 */
function typeBadges(type?: string) {
  return type ? [{ text: formattedItemType(type) }] : []
}

/**
 * Search for and select an existing page item (an event, project, or
 * release). Mirrors `AttachEmbeddedItem`'s shape (existing →
 * `SelectedResult`, else → `Combobox`), but for a `PagePath` item rather
 * than an `EmbeddedItemType` one — these have their own public page, so
 * there's no "create new" affordance here.
 *
 * `TPage`/`S` must be specified explicitly at the call site, since they
 * can't be inferred from the runtime `pagePath` string alone, e.g.
 * `<PageItemPicker<ReleaseClient, FetchReleasesResult> pagePath='releases' .../>`.
 */
export function PageItemPicker<
  TPage extends PageItemClient,
  S extends PageDataResponse
>({
  initialItem,
  name,
  pagePath
}: {
  initialItem?: SelectedPageItem
  /**
   * Form field name for the hidden id input. Defaults to
   * `${pagePathSingulars[pagePath]}Id` (e.g. `releaseId`).
   */
  name?: string
  pagePath: PagePath
}) {
  const [existing, setExisting] = useState<SelectedPageItem | null>(
    initialItem ?? null
  )

  const pagePathSingular = pagePathSingulars[pagePath]
  const fieldName = name ?? `${pagePathSingular}Id`

  return existing ? (
    <div>
      <h2>{itemTypeToLabel(pagePathSingular, true)}</h2>
      <SelectedResult
        itemType={pagePath}
        name={fieldName}
        onClick={() => setExisting(null)}
        item={existing}
        isRequired
      >
        <span>
          {existing.title}
          <Badges badges={typeBadges(existing.type)} />
        </span>
      </SelectedResult>
    </div>
  ) : (
    <Combobox<never, TPage, S>
      itemType={pagePath}
      getCoverImage={(item) => item.coverImage}
      formatResult={(item) => (
        <span>
          {formattedItemTitle(item)}
          <Badges
            badges={typeBadges(
              (item as ReleaseClient | ProjectClient).type
            )}
          />
        </span>
      )}
      onSelect={(item) =>
        setExisting({
          id: item.id,
          title: formattedItemTitle(item),
          coverImage: item.coverImage,
          type: (item as ReleaseClient | ProjectClient).type
        })
      }
    />
  )
}
