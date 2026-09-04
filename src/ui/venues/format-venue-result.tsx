import type { Venue } from '@/lib/venues/schemas/db'
import { ItemResultLabel } from '@/ui/item-result-label'
import { formatVenueInline } from '@/ui/util'

export function formatVenueResult(
  venue: Venue,
  onRemove?: () => void,
  removeLabel?: string,
  extraActions?: React.ReactNode
) {
  return (
    <ItemResultLabel
      title={formatVenueInline({ venue })}
      extraActions={extraActions}
      onRemove={onRemove}
      removeLabel={removeLabel}
    />
  )
}

/**
 * Renders a collapsed chip for a saved-but-unsubmitted "new" venue,
 * matching a saved venue's chip.
 */
export function formatNewVenueSummary(
  data: Record<string, unknown>,
  _previewUrl: string | undefined,
  { onEdit, onRemove }: { onEdit: () => void; onRemove: () => void }
) {
  const url = typeof data.url === 'string' ? data.url : undefined
  return (
    <ItemResultLabel
      title={formatVenueInline({ venue: data as Partial<Venue> })}
      subtitle={url}
      extraActions={
        <button type='button' className='button-sm' onClick={onEdit}>
          Edit
        </button>
      }
      onRemove={onRemove}
      removeLabel='Remove venue'
    />
  )
}
