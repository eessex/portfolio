import React from 'react'
import { connect } from 'react-redux'
import { capitalize } from 'underscore.string'
import { LayoutColumn } from './layout/column.jsx'

const ComingSoon = (props) => {
  const label = props.label || capitalize(props.location.pathname.replace('/',''))

  return (
      <LayoutColumn
        className='ComingSoon'
        label={label}
      >
        Coming Soon
      </LayoutColumn>
  )
}

const mapStateToProps = (state) => ({
  ...state
})

export default connect(
  mapStateToProps
)(ComingSoon)