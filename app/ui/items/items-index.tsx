'use client'

import type { FetchEventsResult } from '@/lib/events/types'
import type { FetchReleasesResult } from '@/lib/releases/types'
import type { PageItemClient, PagePathType } from '@/lib/types'
import type { EmbeddedItemKey } from '@/ui/dashboard/dashboard-items'
import { ExpandCollapseButton } from '@/ui/expand-collapse-button/expand-collapse-button'
import { ItemsList } from '@/ui/items/items-list'
import itemsStyles from '@/ui/items/items.module.scss'
import { SearchInput } from '@/ui/search-input/search-input'
import { camelToSentence, snakeToCamel } from '@/ui/util'
import { clsx } from 'clsx'
import { useState } from 'react'

type PageIndexProps<V extends FetchEventsResult | FetchReleasesResult> = {
  pageType: PagePathType,
  items: V,
  isExpandedOnLoad?: boolean
}

const featuredKeys: (keyof FetchEventsResult | keyof FetchReleasesResult)[] = ['upcomingEvents']

export function ItemsIndex<T extends PageItemClient, V extends FetchEventsResult | FetchReleasesResult> ({
  pageType,
  items,
  isExpandedOnLoad = false
}: PageIndexProps<V>) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isExpanded, setIsExpanded] = useState(isExpandedOnLoad)

  function onSetExpanded () {
    setIsExpanded(!isExpanded)
  }

  function allItems () {
    return Object.values(items).flat()
  }

  function filteredItems () {
    const term = searchTerm.toLowerCase()
    if (!searchTerm) return []

    const matchedItems: T[] = allItems().filter(item =>
      Object.values(item)
        .filter(val => typeof val === 'string')
        .some(val => (val as string).toLowerCase().includes(term))
    )
    return matchedItems
  }

  function featuredItems () {
    const featuredItems: { items: T[], title: string }[] = []
    featuredKeys.forEach(key => {
      if (items[key as keyof V] && (items[key as keyof V] as T[]).length > 0) {
        featuredItems.push({ items: items[key as keyof V] as T[], title: key })
      }
    })
    return featuredItems
  }

  function categorizedItems () {
    const categorizedItems: { items: T[], title: string }[] = []

    Object.entries(items).forEach(([key, value]) => {
      if (value.length === 0) return
      if (featuredKeys.includes(key as keyof FetchEventsResult | keyof FetchReleasesResult)) return

      categorizedItems.push({ items: value as T[], title: key })
    })
    return Object.values(categorizedItems) || []
  }

  function itemType () {
    return camelToSentence(pageType)
  }

  function searchResultsTitle () {
    return `${itemType()} matching "${searchTerm}" (${filteredItems().length})`
  }

  return (
    <div>
      <>
        {featuredItems().map(({ items, title }, i) => (
          <ItemsList<T>
            key={i}
            items={items}
            title={camelToSentence(title)}
            isExpanded
            isFeatured
          />
        ))}
      </>

      <ItemsFilterNav
        itemType={pageType}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        isExpanded={isExpanded}
        onExpand={onSetExpanded}
      />

      <div className={itemsStyles['items-section']}>
        {searchTerm.length > 0
          ? (
            <ItemsList<T>
              title={searchResultsTitle()}
              items={filteredItems()}
              isExpanded={isExpanded}
            />
            )
          : (
            <>
              {categorizedItems().map(({ items, title }, i) => (
                <ItemsList<T>
                  key={i}
                  items={items}
                  title={camelToSentence(title)}
                  isExpanded={isExpanded}
                />
              ))}
            </>
            )}
      </div>
    </div>
  )
}

export function FilterTypeSelect ({
  filterTypes,
  onChange,
  label,
  value
}: {
  filterTypes: Array<string> | undefined
  onChange?: (term: string | undefined) => void | undefined
  label: string
  value?: string | undefined
}) {
  if (!filterTypes || filterTypes.length === 0 || !onChange) return null

  return (
    <div className={clsx(itemsStyles['select'], (value && value !== '') && itemsStyles['is-selected'])}>
      <select
        className='input'
        onChange={e => onChange(e.target.value)}
        defaultValue={value}
        aria-label={label}
      >
        <option value=''>No filters</option>
        {filterTypes.map((type, i) => (
          <option key={i} value={type}>{camelToSentence(snakeToCamel(type))}</option>
        ))}
      </select>
    </div>
  )
}

export function ItemsFilterNav ({
  filterType,
  searchTerm,
  setSearchTerm,
  setFilterType,
  isExpanded,
  onExpand,
  itemType,
  filterTypes
}: {
  filterType?: string,
  searchTerm: string,
  setSearchTerm?: (term: string) => void,
  setFilterType?: (type: string | undefined) => void,
  isExpanded: boolean,
  onExpand: () => void,
  itemType: PagePathType | EmbeddedItemKey,
  filterTypes?: Array<string> | undefined
}) {
  return (
    <nav className={itemsStyles['items-header-controls']}>
      <ul>
        <li>
          <ExpandCollapseButton
            isExpanded={isExpanded}
            onExpand={onExpand}
          />
        </li>

        {setFilterType && filterTypes && (
          <li>
            <FilterTypeSelect
              filterTypes={filterTypes}
              onChange={setFilterType}
              label={`Filter ${itemType}`}
              value={filterType}
            />
          </li>
        )}

        {setSearchTerm && (
          <li>
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              label={`Search ${itemType}`}
            />
          </li>
        )}
      </ul>
    </nav>
  )
}
