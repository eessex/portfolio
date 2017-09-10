import React, { Component } from 'react'
import FontAwesome from 'react-fontawesome'

class AboutSocial extends Component {
  constructor(props) {
    super(props)
  }

  renderSoundcloud(profile) {
    if (profile) {
      return (
        <a target='_blank' href={'http://soundcloud.com/' + profile}>
          <FontAwesome name='soundcloud' />
          Soundcloud
        </a>
      )
    }
  }
  renderTwitter(profile) {
    if (profile) {
      return (
        <a target='_blank' href={'http://twitter.com/' + profile}>
          <FontAwesome name='twitter' />
          Twitter
        </a>
      )
    }
  }
  renderFacebook(profile) {
    if (profile) {
      return (
        <a target='_blank' href={'https://facebook.com/' + profile}>
          <FontAwesome name='facebook' />
          Facebook
        </a>
      )
    }
  }
  renderInstagram(profile) {
    if (profile) {
      return (
        <a target='_blank' href={'https://instagram.com/' + profile}>
          <FontAwesome name='instagram' />
          Instagram
        </a>
      )
    }
  }

  render() {
    const { social } = this.props
    const instagram = social.instagram ? social.instagram : false
    const facebook = social.facebook ? social.facebook : false
    const soundcloud = social.soundcloud ? social.soundcloud : false
    const twitter = social.twitter ? social.twitter : false

    return (
      <div className='social-links'>
        {this.renderSoundcloud(soundcloud)}
        {this.renderInstagram(instagram)}
        {this.renderFacebook(facebook)}
        {this.renderTwitter(twitter)}
      </div>
    )
  }
}

export default AboutSocial