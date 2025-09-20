import clsx from 'clsx'

import styles from '@/ui/form/form.module.scss'
import { camelToSentence, snakeToCamel } from '@/ui/util'

export function Select ({
  ariaControls,
  label,
  onChange,
  options,
  value
}: {
  ariaControls?: string
  label: string
  onChange?: (term: string | undefined) => void | undefined
  options: Array<string> | undefined
  value?: string | undefined
}) {
  if (!options || options.length === 0 || !onChange) return null

  return (
    <div
      className={clsx(styles['select'], (value && value !== '') && 'is-selected')}
    >
      <label className='visually-hidden' htmlFor={label}>{label}</label>
      <select
        aria-controls={ariaControls}
        className='input'
        defaultValue={value}
        id={label}
        onChange={e => onChange(e.target.value)}
      >
        <option value=''>No filters</option>
        {options.map((type, i) => (
          <option key={i} value={type}>{camelToSentence(snakeToCamel(type))}</option>
        ))}
      </select>
    </div>
  )
}
