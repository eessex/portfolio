import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { clone } from 'lodash'
import { LinkEdit } from './link_edit.jsx'

export class LinksEdit extends Component {
  static propTypes = {
    links: PropTypes.array,
    onChange: PropTypes.func
  }

  componentWillUnmount = () => {
    const { links } = this.state
    const cleanedLinks = this.checkEmpty()

    if (cleanedLinks !== links) {
      onChange(cleanedLinks)
    }
  }

  onChange = (link, index) => {
    const { links, onChange } = this.props
    const newLinks = clone(links)

    if (index) {
      newLinks[index] = link
    } else {
      newLinks.push(link)
    }
    onChange(newLinks)
  }

  onDelete = (index) => {
    const { onChange } = this.props
    let newLinks = clone(this.props.links)

    newLinks.splice(index, 1)
    onChange(newLinks)
  }

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