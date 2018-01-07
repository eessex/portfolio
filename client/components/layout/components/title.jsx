import PropTypes from 'prop-types'
import React from 'react'

export const Title = (props) => {
    const {
      title,
      onClick
    } = props

    return (
      <div
        className='Title h1'
        onClick={onClick ? onClick : undefined}
        data-placeholder={onClick && !title}
      >
        {title ? title : 'Add Title'}
      </div>
    )
  }

Title.propTypes = {
  title: PropTypes.string,
  onClick: PropTypes.func
}
