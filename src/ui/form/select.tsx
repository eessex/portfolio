import styles from '@/ui/form/form.module.scss'
import { camelToSentence, snakeToCamel } from '@/ui/util'

export function Select({
  ariaControls,
  attributes,
  isLabelHidden,
  label,
  onChange,
  options,
  placeholder,
  value
}: {
  ariaControls?: string
  attributes?: React.SelectHTMLAttributes<HTMLSelectElement>
  isLabelHidden?: boolean
  label: string
  onChange?: (term: string | undefined) => void | undefined
  options: Array<string> | undefined
  placeholder: string
  value?: string | undefined
}) {
  if (!options || options.length === 0 || !onChange) return null

  return (
    <div
      className={styles['select-container']}
      hidden={attributes?.hidden}
    >
      <label
        className={isLabelHidden ? 'visually-hidden' : ''}
        htmlFor={label}
      >
        {label}
      </label>

      <div className={styles['select']}>
        <select
          aria-controls={ariaControls}
          defaultValue={value}
          id={label}
          onChange={(e) => onChange(e.target.value)}
          {...attributes}
        >
          <option value=''>{placeholder}</option>

          {options.map((type, i) => (
            <option key={i} value={type}>
              {camelToSentence(snakeToCamel(type))}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
