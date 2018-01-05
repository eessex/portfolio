import PropTypes from 'prop-types'
import React from 'react'
import { Button } from'../buttons/button.jsx'
import { LinkEdit } from './link_edit.jsx'

export class EditLinkList extends React.Component {
  static propTypes = {
    activeSection: PropTypes.bool,
    links: PropTypes.array,
    onChange: PropTypes.func
  }

  state = {
    activeSection: null,
    links: this.props.links || []
  }

  newLink = () => {
    const { links } = this.state
    const activeSection = links.length

    links.push({title: '', url: ''})
    this.setState({ activeSection })
  }

  onChange = (link) => {
    const { activeSection, links } = this.state
    const newLinks = links

    newLinks[activeSection] = link
    this.setState({ links: newLinks })
  }

  onDelete = (index) => {
    const { onChange, onDelete } = this.props
    let cleanedLinks = this.state.links

    cleanedLinks.splice(index, 1)
    onChange(cleanedLinks)
    if (onDelete) {
      onDelete()
    }
  }

  toggleEdit = (activeSection) => {
    const links = this.checkEmpty()

    this.props.onChange(links)
    this.setState({ activeSection })
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
    const { activeSection, links } = this.state

    return (
      <div className='EditLinks'>
        {links.map((link, index) =>
          <LinkEdit
            index={index}
            activeSection={activeSection === index}
            key={index}
            link={link}
            onChange={this.onChange}
            onDelete={this.onDelete}
            toggleEdit={this.toggleEdit}
          />
        )}
        <Button
          icon='plus'
          text='Add Link'
          onClick={this.newLink}
        />
      </div>
    )
  }
}