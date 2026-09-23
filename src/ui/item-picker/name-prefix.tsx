'use client'

import { createContext, useContext } from 'react'

/**
 * The namespace an edit form's field names render under. A picker slot
 * provides it so the form doesn't have to be told: `isMulti` indexes
 * under the array name (`images[0].`), a single item namespaces under
 * its id field (`venueId` -> `venue.`) — both derived in
 * `@/lib/item-fields`, matching what `extractIndexedGroups` and
 * `extractPrefixedGroup` strip server-side. Empty outside a picker,
 * where an edit form owns the whole submission and submits bare names.
 */
const NamePrefixContext = createContext('')

export function NamePrefixProvider({
  prefix,
  children
}: {
  prefix: string
  children: React.ReactNode
}) {
  return (
    <NamePrefixContext.Provider value={prefix}>
      {children}
    </NamePrefixContext.Provider>
  )
}

export function useNamePrefix() {
  return useContext(NamePrefixContext)
}
