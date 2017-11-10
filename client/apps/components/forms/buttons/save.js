import React from 'react'

export const SaveButton = (props) => {
  const { isSaved, isSaving, onClick } = props
  const action = isSaving ? 'Saving' : 'Save'

  return (
    <button
      className='PublishButton'
      data-saving={isSaving}
      data-saved={isSaved}
      onClick={onClick}
    >
      {action}
    </button>
  )
}
