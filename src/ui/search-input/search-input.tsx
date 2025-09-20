import { useState } from 'react'

import styles from './search-input.module.scss'

export function SearchInput ({
  value,
  onChange,
  placeholder = 'Search',
  label = 'Search'
}: {
  value: string
  onChange: (newValue: string) => void
  placeholder?: string
  label?: string
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
        type='search'
        id='search-input'
        value={inputValue}
        onChange={e => {
          setInputValue(e.target.value)
          onChange(e.target.value)
        }}
        placeholder={placeholder}
        aria-label='Search'
      />
    </div>
  )
}
