import styled from 'styled-components'
import PropTypes from 'prop-types'
import React from 'react'
import { ShowFormat } from './show_format.jsx'

export const ShowFormats = props => {
  const { items, short, onClick } = props

  return (
    <ShowFormatsContainer
      className='ShowFormats'
      condensed={short}
      onClick={onClick && onClick}
    >
      {items.map((item, index) =>
        <ShowFormat
          key={index}
          item={item}
          short={short}
        />
      )}
    </ShowFormatsContainer>
  )
}

const ShowFormatsContainer = styled.div`
  ${props => props.condensed && `
    display: flex;
    div:first-child {
      margin-right: 20px;
    }
  `}
`

ShowFormats.propTypes = {
  items: PropTypes.array,
  onClick: PropTypes.func,
  short: PropTypes.bool
}
