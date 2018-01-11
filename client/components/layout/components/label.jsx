import { capitalize } from 'underscore.string'
import PropTypes from 'prop-types'
import React from 'react'

export const Label = (props) => {
  const {
    label,
    labelLink,
    model
  } = props
  const formattedLabel = capitalize(label)
  let formattedModel = model ? `/${model}` : undefined

  if (model === 'publications' && label === 'Release') {
    formattedModel = '/releases'
  }

  return (
    <label className='Label'>
      {labelLink && formattedModel
        ? <a href={formattedModel}>{formattedLabel}</a>
        : formattedLabel
      }
    </label>
  )
}

Label.propTypes = {
  label: PropTypes.string,
  labelLink: PropTypes.bool,
  model: PropTypes.string
}
