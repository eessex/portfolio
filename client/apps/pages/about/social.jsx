import React, { Component } from 'react'
import FontAwesome from 'react-fontawesome'
import { capitalize } from 'lodash'

export default class Social extends Component {
  renderSocial = (social, service) => {
    if (social[service]) {
      return (
        <div>
          <a target='_blank' href={'https://' + service + '.com/' + social[service]}>
            <FontAwesome name={service} />
            {capitalize(service)}
          </a>
        </div>
      )
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
    return (
      <div className='social-links'>
        {this.renderSocialList(social)}
      </div>
    )
  }
}
