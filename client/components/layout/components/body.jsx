import PropTypes from 'prop-types'
import React from 'react'
import { RichText } from '../../forms/rich_text/index.jsx'

export const Body = (props) => {
    const {
      body,
      onChange,
      placeholder
    } = props

    return (
      <div className='Body'>
        {onChange
          ? <RichText
              html={body}
              placeholder={placeholder ? placeholder : 'Start typing...'}
              className='Body__edit'
              onChange={onChange}
            />

          : <div
              className='Body__show'
              dangerouslySetInnerHTML={{__html: body}}
            />
        }
      </div>
    )
  }

Body.propTypes = {
  body: PropTypes.string,
  onChange: PropTypes.func,
  placeholder: PropTypes.string
}
