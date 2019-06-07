import React, { Component } from 'react'
import { clone } from 'lodash'
import { LinkEdit } from './link_edit'
import { Link } from 'client/typings'

interface LinksEditProps {
  links: Link[]
  onChange: (links: Link[]) => void
}

export class LinksEdit extends Component<LinksEditProps> {
  componentWillUnmount = () => {
    const { links, onChange } = this.props
    const cleanedLinks = this.checkEmpty()

    if (cleanedLinks !== links) {
      onChange(cleanedLinks)
    }
  }

  onChange = (link, index) => {
    const { links, onChange } = this.props
    const newLinks = clone(links)

    if (index || index === 0) {
      newLinks[index] = link
    } else {
      newLinks.push(link)
    }
    onChange(newLinks)
  }

  onDelete = (index) => {
    const { links, onChange } = this.props
    let newLinks = clone(links)

    newLinks.splice(index, 1)
    onChange(newLinks)
  }

  checkEmpty = () => {
    const { links } = this.props
    let cleanedLinks = clone(links)

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
      <div>
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
          onChange={this.onChange}
          autoFocus={links.length === 0}
        />
      </div>
    )
  }
}
