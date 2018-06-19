import styled from 'styled-components'
import { cloneDeep } from 'lodash'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import * as Actions from '../../../../actions/settings'
import { TextInput, TextInputContainer } from '../../../../components/forms/text_input.js'

export class SiteDescription extends Component {
  static propTypes = {
    settings: PropTypes.object,
    updateSettings: PropTypes.func
  }

  onChange = (key, value) => {
    const { settings, updateSettings } = this.props
    let newSettings = cloneDeep(settings)

    newSettings[key] = value
    updateSettings(newSettings)
  }

  render () {
    const { settings: { description, title } } = this.props

    return (
      <SiteDescriptionContainer>
        <TextInput
          label='Site Title'
          name='title'
          onChange={this.onChange}
          value={title}
        />
        <TextInput
          label='Site Description'
          name='description'
          onChange={this.onChange}
          placeholder='Appears in search results. Limited to 200 characters.'
          textarea
          value={description}
        />
      </SiteDescriptionContainer>
    )
  }
}

const SiteDescriptionContainer = styled.div`
  ${TextInputContainer} {
    margin-bottom: 2em;
  }
`

const mapStateToProps = (state) => ({
  settings: state.settings.settings
})

const mapDispatchToProps = {
  updateSettings: Actions.updateSettings
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SiteDescription)
