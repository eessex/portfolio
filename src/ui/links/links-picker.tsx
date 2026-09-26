import { createLinkSchema, type Link } from '@/lib/links/schemas/db'
import { ItemPicker } from '@/ui/item-picker/item-picker'
import { EditLink } from '@/ui/links/edit-link-form'
import { formatLinkResult } from '@/ui/links/format-link-result'

export function LinksPicker({ links }: { links?: Link[] }) {
  return (
    <ItemPicker<Link>
      isMulti
      itemType='links'
      existingItems={links ?? []}
      renderExistingResult={formatLinkResult}
      schema={createLinkSchema}
      renderEditItemForm={({ errors, isRequired, existingItem }) => (
        <EditLink
          link={existingItem}
          errors={errors}
          isRequired={isRequired}
        />
      )}
    />
  )
}
