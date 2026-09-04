import type { ProjectClient } from '@/lib/projects/types'
import { ItemResultLabel } from '@/ui/item-result-label'
import { formattedItemType } from '@/ui/util'

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
