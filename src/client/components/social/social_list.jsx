import styled from 'styled-components'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import FontAwesome from 'react-fontawesome'
import { capitalize } from 'lodash'
const { SOCIAL_FIXED } = process.env

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
        <SocialContainer isFixed={SOCIAL_FIXED}>
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

  ${props => props.isFixed && `
    justify-content: flex-end;
    position: fixed;
    padding: 5px 0 5px;
    bottom: 0;
    right: 0;
    left: 0;
    a {
      padding: 0;
    }
    @media (max-width: 76rem) {
      flex-direction: row;
      border-top: 1px solid ${({ theme }) => theme.colors.gray};
      background: white;
    }
  `}
`

Social.propTypes = {
  social: PropTypes.array
}
