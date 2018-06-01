import PropTypes from 'prop-types'
import React, { Component } from 'react'
import FontAwesome from 'react-fontawesome'
import { capitalize, cloneDeep } from 'lodash'

export class SocialEdit extends Component {
  static propTypes = {
    onChange: PropTypes.func,
    social: PropTypes.object
  }

  state = {
    isEditing: null
  }

  onChange = (service, value) => {
    const { onChange, social } = this.props
    const newSocial = cloneDeep(social)

    newSocial[service] = value
    onChange('social', newSocial)
  }

  renderSocial = (social, service, i) => {
    const { isEditing } = this.state
    const renderEdit = isEditing === service
      ? this.renderEditPanel(social, service)
      : false
    const isPlaceholder = social[service] ? '' : 'placeholder'

    return (
      <div
        className='edit-social'
        onClick={() => this.setState({ isEditing: service })}
        key={i}
      >
        <a className={isPlaceholder}>
          <FontAwesome name={service} />
          {capitalize(service)}
        </a>
        {renderEdit}
      </div>
    )
  }

  renderEditPanel (social, service) {
    return (
      <div className='edit-social__input' data-name={service}>
        <div>{service + '.com/'}</div>
        <input
          ref={service}
          placeholder='username'
          defaultValue={social[service] ? social[service] : null}
          onChange={(e) => this.onChange(service, e.target.value)}
        />
      </div>
    )
  }

  renderSocialList = (social) => {
    const services = ['bandcamp', 'soundcloud', 'facebook', 'instagram', 'twitter']
    return services.map((service, i) => {
      return this.renderSocial(social, service, i)
    })
  }

  render () {
    const { social } = this.props
    const { isEditing } = this.state

    return (
      <div className='social-links'>
        {this.renderSocialList(social)}
        {isEditing && (
          <div
            className='modal__bg'
            onClick={() => this.toggleEditService(null)}
          />
        )}
      </div>
    )
  }
}
