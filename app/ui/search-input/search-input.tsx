import { useState } from 'react'
import styles from './search-input.module.scss'

export function SearchInput ({
  ariaControls,
  label = 'Search',
  onChange,
  value
}: {
  ariaControls?: string
  label?: string
  onChange: (newValue: string) => void
  value: string
}) {
  const [inputValue, setInputValue] = useState(value)

  return (
    <div className={styles['search-input']}>
      <label
        className='visually-hidden'
        htmlFor='search-input'
      >
        {label}
      </label>
      <input
        aria-controls={ariaControls}
        type='search'
        id='search-input'
        value={inputValue}
        onChange={e => {
          setInputValue(e.target.value)
          onChange(e.target.value)
        }}
        placeholder={label}
      />
    </div>
  )
}
