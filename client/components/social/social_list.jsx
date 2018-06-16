import styled from 'styled-components'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import FontAwesome from 'react-fontawesome'
import { capitalize } from 'lodash'

export class Social extends Component {
  renderSocial = (social, service, i) => {
    if (social[service]) {
      const href = service === 'bandcamp'
        ? `https://${social[service]}.${service}.com/`
        : `https://${service}.com/${social[service]}`

      return (
        <a
          target='_blank'
          href={href}
          key={i}
        >
          <FontAwesome name={service} />
          {capitalize(service)}
        </a>
      )
    }
  }

  renderSocialList = social => {
    if (social) {
      const services = ['bandcamp', 'soundcloud', 'facebook', 'instagram', 'twitter']

      return services.map((service, i) => {
        return this.renderSocial(social, service, i)
      })
    }
  }

  render () {
    const { social } = this.props

    return (
      <SocialContainer>
        {this.renderSocialList(social)}
      </SocialContainer>
    )
  }
}

export const SocialContainer = styled.div`
  display: flex;
  a {
    margin-right: 1em;
    padding-bottom: 5px;
    display: block;
    text-decoration: none;
  }
  .fa {
    margin-right: 5px;
  }
  @media (max-width: 76rem) {
    flex-direction: column;
  }
`

Social.propTypes = {
  social: PropTypes.array
}
