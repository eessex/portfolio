import { XMarkIcon } from '@heroicons/react/24/outline'
import {
  useId,
  useState
} from 'react'

import styles from '@/ui/search-input/search-input.module.scss'

export function SearchInput ({
  ariaControls,
  ariaActivedescendant,
  beforeInputChildren,
  isLabelHidden,
  label = 'Search',
  onChange,
  onClear,
  onKeyDown,
  placeholder,
  role,
  value
}: {
  ariaControls?: string
  ariaActivedescendant?: string
  beforeInputChildren?: React.ReactNode
  isLabelHidden?: boolean
  label?: string
  onChange: (newValue: string) => void
  onClear?: () => void
  onKeyDown?: (e: React.KeyboardEvent) => void
  placeholder?: string
  role?: 'combobox'
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
      <div className={styles['before-input']}>
        <label
          className={isLabelHidden ? 'visually-hidden' : undefined}
          htmlFor={inputId}
        >
          {label}
        </label>
        {beforeInputChildren}
      </div>

      <div className={styles['search-input-container']}>
        <input
          aria-controls={ariaControls}
          aria-activedescendant={ariaActivedescendant}
          id={inputId}
          placeholder={placeholder || (isLabelHidden ? label : undefined)}
          role={role}
          type='search'
          value={inputValue}
          onChange={e => onInputChange(e.target.value)}
          onKeyDown={onKeyDown}
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
