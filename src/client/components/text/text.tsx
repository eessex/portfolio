import React from 'react'
import { PlainText } from 'client/components/text/draft/PlainText'

interface TextProps {
  placeholder?: string
  onChange?: (val: string) => void
  onClick?: () => void
  text?: string
}

export const Text: React.SFC<TextProps> = props => {
  const {
    onClick,
    onChange,
    placeholder,
    text
  } = props

  return (
    <div
      onClick={onClick || undefined}
      data-placeholder={onClick && !text}
    >
      {onChange
        ? (
          <PlainText
            content={text}
            placeholder={placeholder}
            onChange={(value) => onChange(value)}
          />
        )
        : text || placeholder || 'Start typing'
      }
    </div>
  )
}
