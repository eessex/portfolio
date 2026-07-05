export function Loading({ className }: { className?: string }) {
  return (
    <div className={className || 'loading'} role='status'>
      <p>
        <b>Loading...</b>
      </p>
    </div>
  )
}
