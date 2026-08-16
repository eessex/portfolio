import { XMarkIcon } from '@heroicons/react/24/outline'
import { useId, useState } from 'react'

import { InputLabel } from '@/ui/form/input-label'
import styles from '@/ui/search-input/search-input.module.scss'

export interface SearchInputProps {
  ariaControls?: string
  ariaActivedescendant?: string
  beforeInputChildren?: React.ReactNode
  description?: string
  isLabelHidden?: boolean
  isRequired?: boolean
  label?: string
  onChange: (newValue: string) => void
  onClear?: () => void
  onKeyDown?: (e: React.KeyboardEvent) => void
  placeholder?: string
  role?: 'combobox'
  value: string
}

export function SearchInput({
  ariaControls,
  ariaActivedescendant,
  beforeInputChildren,
  description,
  isLabelHidden,
  isRequired,
  label = 'Search',
  onChange,
  onClear,
  onKeyDown,
  placeholder,
  role,
  value
}: SearchInputProps) {
  const [inputValue, setInputValue] = useState(value)
  const inputId = useId()
  const descriptionId = useId()

  function onInputChange(v: string) {
    setInputValue(v)
    onChange(v)

    if (v === '' && onClear) {
      onClear()
    }
  }

  return (
    <div className={styles['search-input']}>
      <div className={styles['before-input']}>
        <InputLabel
          htmlFor={inputId}
          isVisuallyHidden={isLabelHidden}
          isRequired={isRequired}
          label={label}
          description={description}
          descriptionId={descriptionId}
        />
        {beforeInputChildren}
      </div>

      <div className={styles['search-input-container']}>
        <input
          aria-controls={ariaControls}
          aria-activedescendant={ariaActivedescendant}
          aria-describedby={description ? descriptionId : undefined}
          id={inputId}
          placeholder={
            placeholder || (isLabelHidden ? label : undefined)
          }
          role={role}
          type='search'
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
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
