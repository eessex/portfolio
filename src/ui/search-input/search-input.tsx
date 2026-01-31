import { XMarkIcon } from '@heroicons/react/24/outline'
import {
  useId,
  useState
} from 'react'

import styles from '@/ui/search-input/search-input.module.scss'

export function SearchInput ({
  ariaControls,
  isLabelHidden,
  label = 'Search',
  onChange,
  onClear,
  placeholder,
  value
}: {
  ariaControls?: string
  isLabelHidden?: boolean
  label?: string
  onChange: (newValue: string) => void
  onClear?: () => void
  placeholder?: string
  value: string
}) {
  const [inputValue, setInputValue] = useState(value)
  const inputId = useId()

  function onInputChange (v: string) {
    setInputValue(v)
    onChange(v)

    if (v === '' && onClear) {
      onClear()
    }
  }

  return (
    <div className={styles['search-input']}>
      <label
        className={isLabelHidden ? 'visually-hidden' : undefined}
        htmlFor={inputId}
      >
        {label}
      </label>

      <div className={styles['search-input-container']}>
        <input
          aria-controls={ariaControls}
          type='search'
          id={inputId}
          value={inputValue}
          onChange={e => onInputChange(e.target.value)}
          placeholder={placeholder || (isLabelHidden ? label : undefined)}
        />
        {inputValue && (
          <button
            aria-label='Clear search'
            onClick={() => onInputChange('')}
          >
            <XMarkIcon />
          </button>
        )}
      </div>
    </div>
  )
}
