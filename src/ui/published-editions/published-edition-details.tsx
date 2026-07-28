import type { DashboardPublishedEdition } from '@/lib/published-editions/schemas/client'

export function PublishedEditionDetails({
  edition
}: {
  edition: DashboardPublishedEdition
}) {
  return (
    <>
      <span>{edition.format}</span>
      {edition.publisher?.name && (
        <span> · {edition.publisher.name}</span>
      )}
    </>
  )
}
