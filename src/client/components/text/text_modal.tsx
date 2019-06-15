import React from 'react'
import { Modal } from 'client/components/modal/modal'
import { PlainText } from 'client/components/text/draft/PlainText'

interface TextModalProps {
  label?: string
  placeholder?: string
  onChange: (val: string) => void
  setEditing: (isEditing: string | null) => void
  text?: string
}

export const TextModal: React.SFC<TextModalProps> = props => {
  const {
    label,
    onChange,
    placeholder,
    setEditing,
    text
  } = props

  return (
    <Modal onClick={() => setEditing(null)}>
      {label &&
        <label>{label}</label>
      }
      <PlainText
        content={text}
        placeholder={placeholder}
        onChange={(value) => onChange(value)}
      />

    </Modal>
  )
}
