import React from 'react'
import { capitalize } from 'underscore.string'
import { LayoutColumn } from './layout/column.jsx'

export const ComingSoon = (props) => {
  const label = capitalize(props.location.pathname.replace('/',''))

  return (
      <LayoutColumn
        className='ComingSoon'
        label={label}
      >
        Coming Soon
      </LayoutColumn>
  )
}
