import PropTypes from 'prop-types'
import React from 'react'

export const PublishButton = (props) => {
  const { published, onClick } = props
  const action = published ? 'Unpublish' : 'Publish'

  return (
    <button
      className='PublishButton'
      onClick={() => onClick('published', !published)}
    >
      {action}
    </button>
  )
}

PublishButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  published: PropTypes.bool
}
