import { XMarkIcon } from '@heroicons/react/24/outline'
import {
  useId,
  useState
} from 'react'

import styles from '@/ui/search-input/search-input.module.scss'

export function SearchInput ({
  ariaControls,
  label = 'Search',
  onChange,
  onClear,
  value
}: {
  ariaControls?: string
  label?: string
  onChange: (newValue: string) => void
  onClear?: () => void
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
        className='visually-hidden'
        htmlFor={inputId}
      >
        {label}
      </label>
      <input
        aria-controls={ariaControls}
        type='search'
        id={inputId}
        value={inputValue}
        onChange={e => onInputChange(e.target.value)}
        placeholder={label}
      />
      {inputValue && (
        <button
          type='button'
          aria-label='Clear search'
          onClick={() => onInputChange('')}
        >
          <XMarkIcon />
        </button>
      )}
    </div>
  )
}
