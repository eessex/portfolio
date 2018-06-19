import PropTypes from 'prop-types'
import React from 'react'
import { ButtonContainer } from './button.jsx'

export const SaveButton = (props) => {
  const { isSaved, isSaving, onClick } = props
  const action = isSaving ? 'Saving' : 'Save'

  return (
    <ButtonContainer
      data-saving={isSaving}
      data-saved={isSaved}
      onClick={onClick}
      color={textColor(!isSaved, isSaving)}
    >
      {action}
    </ButtonContainer>
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
