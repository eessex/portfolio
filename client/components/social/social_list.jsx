import React, { Component } from 'react'
import FontAwesome from 'react-fontawesome'
import { capitalize } from 'lodash'

export class Social extends Component {
  renderSocial = (social, service, i) => {
    if (social[service]) {
      return (
        <div key={i}>
          <a
            target='_blank'
            href={'https://' + service + '.com/' + social[service]}
          >
            <FontAwesome name={service} />
            {capitalize(service)}
          </a>
        </div>
      )
    }
  }

  renderSocialList = (social) => {
    if (social && social.length) {
      const services = ['soundcloud', 'facebook', 'instagram', 'twitter']

      return services.map((service, i) => {
        return this.renderSocial(social, service, i)
      })
    }
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
