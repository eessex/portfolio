import type { ProjectClient } from '@/lib/projects/types'
import { formattedItemType } from '@/ui/format/items'
import { ItemResultLabel } from '@/ui/item-result-label'

export function formatProjectResult(
  project: ProjectClient,
  onRemove?: () => void,
  removeLabel?: string,
  extraActions?: React.ReactNode
) {
  return (
    <ItemResultLabel
      title={project.title}
      badges={
        project.type
          ? [{ text: formattedItemType(project.type) }]
          : undefined
      }
      coverImage={project.coverImage}
      extraActions={extraActions}
      onRemove={onRemove}
      removeLabel={removeLabel}
    />
  )
}
