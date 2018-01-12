import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { clone } from 'lodash'
import { LinkEdit } from './link_edit.jsx'

export class LinksEdit extends Component {
  static propTypes = {
    links: PropTypes.array,
    onChange: PropTypes.func
  }

  onChange = (link, index) => {
    const { links, onChange } = this.props
    const newLinks = clone(links)

    newLinks[index] = link
    onChange(newLinks)
  }

  onDelete = (index) => {
    debugger
    // const { onChange, onDelete } = this.props
    // let cleanedLinks = this.state.links

    // cleanedLinks.splice(index, 1)
    // onChange(cleanedLinks)
    // if (onDelete) {
    //   onDelete()
    // }
  }

  // toggleEdit = () => {
  //   const links = this.checkEmpty()

  //   this.props.onChange(links)
  // }

  checkEmpty = () => {
    const { links } = this.state
    let cleanedLinks = links

    links.map((link, index) => {
      if (!link.url.length) {
        cleanedLinks.splice(index, 1)
      }
    })
    return cleanedLinks
  }

  render () {
    const { links } = this.props

    return (
      <div className='EditLinks'>
        {links.map((link, index) =>
          <LinkEdit
            {...link}
            index={index}
            key={index}
            onChange={this.onChange}
            onDelete={this.onDelete}
            autoFocus={index === 0}
          />
        )}
        <LinkEdit
          link={{}}
          onChange={this.onChange}
          autoFocus={links.length === 0}
        />
      </div>
    )
  }
}