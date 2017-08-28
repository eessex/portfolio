import React, { Component } from 'react'
import EditLink from './link.jsx'

export default class EditLinks extends Component {
  constructor(props) {
    super(props)

    this.state = {
      editLink: null
    }

    this.setEditLink = this.setEditLink.bind(this)
    this.toggleEditLink = this.toggleEditLink.bind(this)
    this.onChangeLink = this.onChangeLink.bind(this)
  }

  setEditLink(e) {
    const editLink = parseInt(e.target.name.replace('edit-', ''))
    this.setState({ editLink })
  }

  toggleEditLink() {
    const links = this.props.links
    const link = links[this.state.editLink]
    if (link.url) {
      this.setState({editLink: null})
    } else if (link.title) {
      alert('URL is required')
    } else {
      links.splice(this.state.editLink, 1)
      this.props.onChange('links', links)
    }
  }

  onChangeLink(key, value, index) {
    const links = this.props.links
    const link = links[index]
    const keys = key.split('-')
    link[keys[1]] = value
    links[index] = link
    this.props.onChange('links', links)
  }

  renderLinkInput(link, onSave, index) {
    return (
      <div className='event--edit__link-input'>
        <EditLink link={link} onChange={this.onChangeLink} index={index} />
        <button className='save' onClick={onSave}>Save</button>
      </div>
    )
  }

  renderLinkActions(link, index) {
    if (this.state.editLink === index) {
      return this.renderLinkInput(link, this.toggleEditLink, index)
    } else {
      return <button className='edit' name={'edit-' + index} onClick={this.setEditLink}>Edit</button>
    }
  }

  renderModal(index) {
    if (this.state.editLink === index) {
      return <div className='modal__bg' onClick={this.toggleEditLink}></div>
    }
  }

  renderSavedLink(link, index) {
    return (
      <div className='event--edit__link' key={index}>
        <a href={link.url}>{link.title || link.url}</a>
        {this.renderLinkActions(link, index)}
        {this.renderModal(index)}
      </div>
    )
  }

  render () {
    const { links } = this.props
    const listItems =  links.map( (link, index) => this.renderSavedLink(link, index) )
    return (
      <div className='event--edit__links'>
        {listItems}
      </div>
    )
  }
}







