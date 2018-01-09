import PropTypes from 'prop-types'
import React from 'react'
import { RichText } from '../../forms/rich_text/index.jsx'

export const ItemDescription = (props) => {
    const {
      description,
      onChange,
      placeholder
    } = props

    return (
      <div className='ItemDescription'>
        {onChange
          ? <RichText
              html={description}
              placeholder={placeholder ? placeholder : 'Start typing...'}
              className='ItemDescription__edit'
              onChange={(value) => onChange('description', value)}
            />

          : <div
              className='ItemDescription__show'
              dangerouslySetInnerHTML={{__html: description}}
            />
        }
      </div>
    )
  }

ItemDescription.propTypes = {
  description: PropTypes.string,
  onChange: PropTypes.func,
  placeholder: PropTypes.string
}
