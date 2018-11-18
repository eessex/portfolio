import styled from 'styled-components'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import FontAwesome from 'react-fontawesome'
import { capitalize } from 'lodash'

export class Social extends Component {
  renderSocial = (account, i) => {
    const { service, profile } = account
    if (profile) {
      const href = service === 'bandcamp'
        ? `https://${profile}.${service}.com/`
        : `https://${service}.com/${profile}`
      const icon = service === 'discogs' ? 'compact-disc' : service

      return (
        <a
          target='_blank'
          href={href}
          key={i}
        >
          <FontAwesome name={icon} />
          {capitalize(service)}
        </a>
      )
    }
  }

  render () {
    const { social } = this.props
    if (social.length > 0) {
      return (
        <SocialContainer>
          {social.map((account, i) => this.renderSocial(account, i))}
        </SocialContainer>
      )
    } else {
      return null
    }
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
