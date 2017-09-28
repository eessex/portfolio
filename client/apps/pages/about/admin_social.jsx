import React, { Component } from 'react'
import FontAwesome from 'react-fontawesome'
const _ = require('lodash')

export default class AdminSocial extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isEditing: null
    }
  }

  toggleEditService = (service) => {
    this.setState({ isEditing: service })
  }

  onChange = (service) => {
    const val = this.refs[service].value
    const social = this.props.social
    social[service] = val
    this.props.onChange('social', social)
  }

  renderSocial = (social, service) => {
    const { isEditing } = this.state
    const renderEdit = isEditing === service ? this.renderEditPanel(social, service) : false
    const isPlaceholder = social[service] ? '' : 'placeholder'

    return (
        <div className='edit-social' onClick={() => this.toggleEditService(service)}>
          <a className={isPlaceholder}>
            <FontAwesome name={service} />
            {_.capitalize(service)}
          </a>
          {renderEdit}
        </div>
      )
  }

  renderEditPanel(social, service) {
    return (
      <div className='edit-social__input' data-name={service}>
        <div>{service + '.com/'}</div>
        <input
          ref={service}
          placeholder='username'
          defaultValue={social[service] ? social[service] : null}
          onChange={() => this.onChange(service)} />
      </div>
    )
  }

  renderModal = (isEditing) => {
    if (isEditing) {
      return <div className='modal__bg' onClick={() => this.toggleEditService(null)}></div>
    }
  }

  renderSocialList = (social) => {
    const services = ['soundcloud', 'facebook', 'instagram', 'twitter']
    const rendered = services.map((service, i) => {
      return this.renderSocial(social, service)
    })
    return rendered
  }

  render() {
    const { social } = this.props
    const { isEditing } = this.state 
    return (
      <div className='social-links'>
        {this.renderSocialList(social)}
        {this.renderModal(isEditing)}
      </div>
    )
  }
}
