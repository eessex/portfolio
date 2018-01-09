import PropTypes from 'prop-types'
import React from 'react'
import { RichText } from '../../forms/rich_text/index.jsx'

export const Description = (props) => {
    const {
      description,
      onChange,
      placeholder
    } = props

    return (
      <div className='Description'>
        {onChange
          ? <RichText
              html={description}
              placeholder={placeholder ? placeholder : 'Start typing...'}
              className='Description__edit'
              onChange={(value) => onChange('description', value)}
            />

          : <div
              className='Description__show'
              dangerouslySetInnerHTML={{__html: description}}
            />
        }
      </div>
    )
  }

Description.propTypes = {
  description: PropTypes.string,
  onChange: PropTypes.func,
  placeholder: PropTypes.string
}
