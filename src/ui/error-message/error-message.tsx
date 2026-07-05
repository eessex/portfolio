import styles from '@/ui/error-message/error-message.module.scss'

export function ErrorMessage({
  title,
  message = 'Sorry, an unexpected error occurred. Please try again.',
  onRetry
}: {
  title?: string
  message?: string
  onRetry?: () => void
}) {
  return (
    <div className={styles['error-message']}>
      {title && <h1>{title}</h1>}
      <p>{message}</p>
      {onRetry && (
        <button className='button-primary' onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  )
}
