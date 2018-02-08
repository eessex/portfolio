import PropTypes from 'prop-types'
import React from 'react'

export const SaveButton = (props) => {
  const { isSaved, isSaving, onClick } = props
  const action = isSaving ? 'Saving' : 'Save'

  return (
    <button
      className='SaveButton'
      data-saving={isSaving}
      data-saved={isSaved}
      onClick={onClick}
      style={{color: textColor(!isSaved, isSaving)}}
    >
      {action}
    </button>
  )
}

function textColor (needsSave, isSaving) {
  if (isSaving) {
    return 'limegreen'
  } else if (needsSave) {
    return 'red'
  } else {
    return 'black'
  }
}

SaveButton.propTypes = {
  isSaved: PropTypes.bool,
  isSaving: PropTypes.bool,
  onClick: PropTypes.func.isRequired
}
