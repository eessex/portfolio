'use client'

import { useState } from 'react'

import { type PagePath, pagePathSingulars } from '@/lib/schemas'
import type {
  PageDataResponse,
  PageItemClient,
  PageItemResponseWithCursor
} from '@/lib/types'
import { Combobox } from '@/ui/combobox/combobox'
import { SelectedResult } from '@/ui/selected-results/selected-result'
import type { ResultsResponse } from '@/ui/useResultsList'
import { formattedItemTitle, itemTypeToLabel } from '@/ui/util'

export type SelectedPageItem = Pick<
  PageItemClient,
  'id' | 'title' | 'coverImage'
>

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

  // Safe to start with an empty (rather than fully-keyed) grouped object:
  // useResultsList only reads real category keys from a fetched response,
  // never from this initial value, before the first search resolves.
  const emptyResults: PageItemResponseWithCursor<TPage, S> = {
    res: {} as Record<keyof S, TPage[]>,
    nextCursor: null,
    totalCount: 0
  }
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
        {existing.title}
      </SelectedResult>
    </div>
  ) : (
    <Combobox<never, TPage, S>
      initialResults={
        emptyResults as ResultsResponse<never, TPage, S>
      }
      itemType={pagePath}
      formatResult={formattedItemTitle}
      onSelect={(item) =>
        setExisting({
          id: item.id,
          title: formattedItemTitle(item),
          coverImage: item.coverImage
        })
      }
    />
  )
}
