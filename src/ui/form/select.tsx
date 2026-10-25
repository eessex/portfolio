import { useId } from 'react'

import { camelToSentence } from '@/lib/strings'
import { FieldErrorList } from '@/ui/form/field-error-list'
import styles from '@/ui/form/form.module.scss'
import { InputLabel } from '@/ui/form/input-label'

export function Select({
  ariaControls,
  attributes,
  description,
  errors,
  formatOptionLabel = (option) => camelToSentence(option),
  isLabelHidden,
  label,
  onChange,
  options,
  placeholder,
  value
}: {
  ariaControls?: string
  attributes?: React.SelectHTMLAttributes<HTMLSelectElement>
  description?: string
  errors?: string[]
  formatOptionLabel?: (option: string) => string
  isLabelHidden?: boolean
  label: string
  /** Optional: the select is uncontrolled (`value` is its default). */
  onChange?: (term: string | undefined) => void | undefined
  options: Array<string> | undefined
  placeholder?: string
  value?: string | undefined
}) {
  const id = useId()
  const errorId = useId()
  const hasErrors = !!errors?.length

  if (!options || options.length === 0) return null

  return (
    <div
      className={styles['select-container']}
      hidden={attributes?.hidden}
    >
      <InputLabel
        htmlFor={id}
        isVisuallyHidden={isLabelHidden}
        isRequired={attributes?.required}
        label={label}
        description={description}
      />

      <div className={styles['select']}>
        <select
          aria-controls={ariaControls}
          aria-describedby={hasErrors ? errorId : undefined}
          aria-invalid={hasErrors || undefined}
          defaultValue={value}
          id={id}
          onChange={(e) => onChange?.(e.target.value)}
          {...attributes}
        >
          {placeholder && <option value=''>{placeholder}</option>}

          {options.map((option, i) => (
            <option key={i} value={option}>
              {formatOptionLabel(option)}
            </option>
          ))}
        </select>
      </div>
      <FieldErrorList id={errorId} errors={errors} />
    </div>
  )
}
