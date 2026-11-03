export function DraftBadge({
  label = 'Unpublished'
}: {
  label?: string
}) {
  return <mark className='draft-badge badge'>{label}</mark>
}
