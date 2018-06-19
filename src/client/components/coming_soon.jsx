import PropTypes from 'prop-types'
import React from 'react'
import { connect } from 'react-redux'
import { capitalize } from 'underscore.string'
import { LayoutColumn } from 'client/components/layout/column'

const ComingSoon = props => {
  const label = props.label || capitalize(props.location.pathname.replace('/', ''))

  return (
    <LayoutColumn label={label}>
      Coming Soon
    </LayoutColumn>
  )
}

ComingSoon.propTypes = {
  label: PropTypes.string,
  location: PropTypes.action
}

const mapStateToProps = state => ({
  ...state
})

export default connect(
  mapStateToProps
)(ComingSoon)
