import { useId } from 'react'

import { camelToSentence, snakeToCamel } from '@/lib/strings'
import styles from '@/ui/form/form.module.scss'
import { InputLabel } from '@/ui/form/input-label'

export function Select({
  ariaControls,
  attributes,
  formatOptionLabel = (option) =>
    camelToSentence(snakeToCamel(option)),
  isLabelHidden,
  label,
  onChange,
  options,
  placeholder,
  value
}: {
  ariaControls?: string
  attributes?: React.SelectHTMLAttributes<HTMLSelectElement>
  formatOptionLabel?: (option: string) => string
  isLabelHidden?: boolean
  label: string
  onChange?: (term: string | undefined) => void | undefined
  options: Array<string> | undefined
  placeholder?: string
  value?: string | undefined
}) {
  const id = useId()

  if (!options || options.length === 0 || !onChange) return null

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
      />

      <div className={styles['select']}>
        <select
          aria-controls={ariaControls}
          defaultValue={value}
          id={id}
          onChange={(e) => onChange(e.target.value)}
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
    </div>
  )
}
