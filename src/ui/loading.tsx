export function Loading({ className }: { className?: string }) {
  return (
    <div className={className || 'loading'}>
      <p>
        <b>Loading...</b>
      </p>
    </div>
  )
}
