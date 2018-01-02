import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Col, Row } from 'react-styled-flexboxgrid'
import { Button } from '../../../../components/forms/buttons/button.jsx'
import { EditFormat } from './edit_format.jsx'

export class EditFormats extends Component {
  static propTypes = {
    index: PropTypes.number,
    onChange: PropTypes.func.isRequired,
    publication: PropTypes.object.isRequired
  }
  constructor(props) {
    super(props)

    this.state = {
      showNewForm: props.index || props.index === 0 ? true : false
    }
  }

  onChangeFormat = (item, index) => {
    const { onChange, publication } = this.props
    const { formats } = publication

    formats[index] = item
    onChange('formats', formats)
  }

  onNewFormat = (item) => {
    const { onChange } = this.props
    const { formats } = this.props.publication

    formats.push(item)
    onChange('formats', formats)
    this.setState({ showNewForm: false })
  }

  renderNew = () => {
    const { showNewForm } = this.state

    if (showNewForm) {
      return <EditFormat onChange={this.onNewFormat} item={{}} />
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
    const { publication } = this.props
    const formats = publication.formats || []

    return (
      <div className='EditFormats'>
        <div className='EditFormats__inner'>
          <label>Formats:</label>
          {formats.map((format, index) =>
            <EditFormat
              index={index}
              item={format}
              key={index}
              onChange={this.onChangeFormat}
            />
          )}
          {this.renderNew()}
        </div>
      </div>
    )
  }
}
