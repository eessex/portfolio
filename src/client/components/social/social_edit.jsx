import styled from 'styled-components'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import FontAwesome from 'react-fontawesome'
import { capitalize, cloneDeep } from 'lodash'
import { SocialContainer } from './social_list'
import { ModalBackground } from 'client/components/modal/modal_background'

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
    const isPlaceholder = !social[service]
    const icon = service === 'discogs' ? 'compact-disc' : service

    return (
      <SocialItem
        onClick={() => this.setState({ isEditing: service })}
        key={i}
      >
        <A isPlaceholder={isPlaceholder}>
          <FontAwesome name={icon} />
          {capitalize(service)}
        </A>
        {renderEdit}
      </SocialItem>
    )
  }

  renderEditPanel (social, service) {
    const isBandCamp = service === 'bandcamp'
    const href = isBandCamp ? `.${service}.com` : `${service}.com/`
    return (
      <SocialInput data-name={service}>
        {!isBandCamp &&
          <div>{href}</div>
        }
        <input
          ref={service}
          placeholder='username'
          defaultValue={social[service] ? social[service] : null}
          onChange={(e) => this.onChange(service, e.target.value)}
        />
        {isBandCamp &&
          <div>{href}</div>
        }
      </SocialInput>
    )
  }

  renderSocialList = social => {
    const services = [
      'bandcamp',
      'discogs',
      'soundcloud',
      'facebook',
      'instagram',
      'twitter'
    ]
    return services.map((service, i) => {
      return this.renderSocial(social, service, i)
    })
  }

  render () {
    const { social } = this.props
    const { isEditing } = this.state

    return (
      <SocialContainer>
        {this.renderSocialList(social)}

        {isEditing && (
          <ModalBackground
            onClick={() => this.setState({ isEditing: null })}
          />
        )}
      </SocialContainer>
    )
  }
}

export const SocialItem = styled.div`
  position: relative;
`

const A = styled.a`
  ${props => props.isPlaceholder && `
    color: #ddd !important;
  `}
`

const SocialInput = styled.div`
  border: 1px solid;
  position: absolute;
  background: white;
  z-index: 2;
  padding: 10px;
  top: 1.75em;
  display: flex;
  input {
    border-top: none;
    border-right: none;
    border-left: none;
    border-bottom: 1px solid;
    font-size: .9em;
    padding-left: 5px;
  }
  &::before {
    content: '.';
    color: transparent;
    width: 0;
    height: 0;
    border-left: 15px solid transparent;
    border-right: 15px solid transparent;
    border-bottom: 16px solid white;
    position: absolute;
    top: -16px;
    left: 7px;
    z-index: 2;
  }
  &::after {
    content: '.';
    color: transparent;
    width: 0;
    height: 0;
    border-left: 17px solid transparent;
    border-right: 17px solid transparent;
    border-bottom: 17px solid black;
    position: absolute;
    top: -17.5px;
    left: 5px;
    z-index: 1;
  }
`
