import styled from 'styled-components'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Button } from '../buttons/button.jsx'
import { Modal } from '../../layout/modal.jsx'
import { LinkForm } from './link_form.jsx'

export class LinkEdit extends Component {
  constructor(props) {
    super(props)

    this.state = {
      isEditing: false
    }
  }

  toggleEdit = () => {
    const { isEditing } = this.state
    this.setState({ isEditing: !isEditing })
  }

  render () {
    const { onDelete, index } = this.props
    const { title, url } = this.props.link
    const { isEditing } = this.state

    return (
      <div className='LinkEdit'>
        <LinkEditContainer className='LinkEdit__item'>
          <a href={url} target='_blank'>
            {title ? title : url}
          </a>

          <div className='LinkEdit__actions'>
            <Button
              icon='pencil'
              borderless
              onClick={this.toggleEdit}
            />
            <Button
              icon='times'
              borderless
              onClick={() => onChange({}, index)}
            />
          </div>
        </LinkEditContainer>

        {isEditing &&
          <div>
            <Modal onClick={this.toggleEdit} />
            <LinkForm
              title={title}
              url={url}
              onChange={this.onChange}
            />
          </div>
        }
      </div>
    )
  }
}

LinkEdit.propTypes = {
  onChange: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  index: PropTypes.number,
  link: PropTypes.object.isRequired
}

const LinkEditContainer = styled.div`
  display: flex;
  align-items: center;
  button {
    padding: 0 5px;
  }
  .LinkEdit__actions {
    padding-left: 10px;
  }
`
