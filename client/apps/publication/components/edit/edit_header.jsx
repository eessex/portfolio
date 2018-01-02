import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { EditFormats } from './edit_formats.jsx'
import { EditText } from './edit_text.jsx'
import { PlainText } from '../../../../components/forms/rich_text/plain_text.jsx'
import { RichText } from '../../../../components/forms/rich_text/index.jsx'
import { Modal } from '../../../../components/layout/modal.jsx'
import { ShowFormat } from '../show/show_format.jsx'

export class EditHeader extends Component {
  static propTypes = {
    label: PropTypes.string,
    publication: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired
  }

  state = {
    isEditing: null
  }

  renderInputFields = () => {
    const { publication, onChange } = this.props
    const { isEditing } = this.state
    let inputs

    switch (isEditing) {
      case 'artist': {
        inputs = <EditText
          className='h1'
          name='artist'
          onChange={onChange}
          value={publication.artist}
        />
      }
      case 'formats': {
        inputs = <EditFormats {...this.props} />
      }
      case 'title': {
        inputs = <EditText
          className='h1'
          name='title'
          onChange={onChange}
          value={publication.title}
        />
      }
    }
    return (
      <div className='EditModal__inputs'>
        {inputs}
      </div>
    )
  }

  render () {
    const { publication, onChange } = this.props
    const { isEditing } = this.state
    const { artist, formats, title } = publication

    return (
      <div className='EditHeader'>
        <div className='EditHeader__title h1'>
          <div className='artist' onClick={() => this.setState({isEditing: 'artist'})}>
            {artist ? `${artist}: ` : 'Add Artist'}
          </div>
          <div className='title' onClick={() => this.setState({isEditing: 'title'})}>
            {title}
          </div>
        </div>

        {formats && formats.length &&
          formats.map((format, index) =>
            <ShowFormat
              item={format}
              key={index}
              onClick={() => this.setState({isEditing: 'formats'})}
            />
          )}

        <RichText
          html={publication.description}
          placeholder='Description'
          className='Publication__description'
          onChange={(value) => this.onChange('description', value)}
        />


        {isEditing &&
          <div className='editModal'>
            {this.renderInputFields()}
            <Modal
              backgroundColor='rgba(0,0,0,.5)'
              onClick={() => this.setState({ isEditing: null })}
            />
          </div>
        }
      </div>
    )
  }
}
