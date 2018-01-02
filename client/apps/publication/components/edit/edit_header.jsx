import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { ModalContainer } from '../../../../components/modal/modal_container.jsx'
import { PlainText } from '../../../../components/forms/rich_text/plain_text.jsx'
import { RichText } from '../../../../components/forms/rich_text/index.jsx'
import { ShowFormat } from '../show/show_format.jsx'
import { EditFormats } from './edit_formats.jsx'
import { EditText } from './edit_text.jsx'

export class EditHeader extends Component {
  static propTypes = {
    className: PropTypes.string,
    isEditing: PropTypes.string,
    label: PropTypes.string,
    publication: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    setEditing: PropTypes.func.isRequired
  }

  renderInputFields = () => {
    const { isEditing, label, publication, onChange } = this.props
    let inputs

    switch (isEditing) {
      case 'title': {
        return <EditText
          className='h1'
          label={label}
          name='title'
          onChange={onChange}
          value={publication.title}
        />
      }
      case 'artist': {
        return <EditText
          className='h1'
          label={label}
          name='artist'
          onChange={onChange}
          value={publication.artist}
        />
      }
      case 'formats': {
        return <EditFormats {...this.props} />
      }
    }
  }

  render () {
    const { className, onChange, isEditing, publication, setEditing } = this.props
    const { artist, formats, title } = publication

    return (
      <div className={`EditHeader ${className}`}>
        <div className='EditHeader__title h1'>
          <div className='artist' onClick={() => setEditing('artist')}>
            {artist ? `${artist}: ` : 'Add Artist'}
          </div>
          <div className='title' onClick={() => setEditing('title')}>
            {title}
          </div>
        </div>

        {formats && formats.length &&
          formats.map((format, index) =>
            <ShowFormat
              item={format}
              key={index}
              onClick={() => setEditing('formats')}
            />
          )}

        {isEditing &&
         ['artist', 'formats', 'title'].indexOf(isEditing) !== -1 &&
          <ModalContainer onClick={() => setEditing(null)}>
            {this.renderInputFields()}
          </ModalContainer>
        }
      </div>
    )
  }
}
