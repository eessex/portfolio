import PropTypes from 'prop-types'
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
      style={{color: textColor(!isSaved, isSaving)}}
    >
      {action}
    </button>
  )
}

function textColor (needsSave, isSaving) {
  if (needsSave) {
    return 'red'
  } if (isSaving) {
    return 'limegreen'
  } else {
    return 'black'
  }
}

SaveButton.propTypes = {
  isSaved: PropTypes.bool,
  isSaving: PropTypes.bool,
  onClick: PropTypes.func.isRequired
}
