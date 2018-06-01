import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Button } from '../forms/buttons/button.jsx'
import { FormatEdit } from '../format/format_edit.jsx'

export class FormatsEdit extends Component {
  static propTypes = {
    formats: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired
  }

  state = {
    showNewForm: this.props.formats.length === true
  }

  onChangeFormat = (item, index) => {
    const { onChange, formats } = this.props

    formats[index] = item
    onChange('formats', formats)
  }

  onNewFormat = (item) => {
    const { onChange, formats } = this.props

    formats.push(item)
    onChange('formats', formats)
    this.setState({ showNewForm: false })
  }

  renderNew = () => {
    const { showNewForm } = this.state

    if (showNewForm) {
      return <FormatEdit onChange={this.onNewFormat} item={{}} />
    } else {
      return (
        <Button
          text='Add New'
          icon='plus'
          onClick={() => this.setState({ showNewForm: true })}
        />
      )
    }
  }

  render () {
    const { formats } = this.props

    return (
      <div className='FormatsEdit'>
        {formats.map((format, index) =>
          <FormatEdit
            index={index}
            item={format}
            key={index}
            onChange={this.onChangeFormat}
          />
        )}

        {this.renderNew()}
      </div>
    )
  }
}

FormatsEdit.propTypes = {
  formats: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired
}
