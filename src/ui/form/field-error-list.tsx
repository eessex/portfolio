import styles from '@/ui/form/form.module.scss'

/**
 * A field's validation errors, announced as an alert. Each message
 * ends with a period (added only if it has none), so Zod defaults
 * ("Required") and written sentences ("Select a project.") read the
 * same. Renders nothing without errors.
 */
export function FieldErrorList({
  errors,
  id
}: {
  errors?: string[]
  id?: string
}) {
  if (!errors?.length) return null

  return (
    <p id={id} role='alert' className={styles['error-message']}>
      {errors.map(toSentence).join(' ')}
    </p>
  )
}

function toSentence(message: string) {
  return /[.!?]$/.test(message) ? message : `${message}.`
}
