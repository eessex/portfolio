import React, { Component } from 'react'
import { Button } from 'client/components/Button'
import { FormatEdit } from '../format/format_edit'
import { Format as FormatType } from 'client/typings'

export interface FormatsEditProps {
  formats?: FormatType[]
  onChange: (key: string, val: FormatType[]) => void
}

interface FormatsEditState {
  showNewForm: boolean
}

export class FormatsEdit extends Component<FormatsEditProps, FormatsEditState> {
  state = {
    showNewForm: this.props.formats.length === 0
  }

  // TODO: Remove format

  onChangeFormat = (item, index) => {
    const { onChange, formats } = this.props

    formats[index] = item
    onChange('formats', formats)
  }

  onNewFormat = item => {
    const { onChange, formats } = this.props

    formats.push(item)
    onChange('formats', formats)
    this.setState({ showNewForm: false })
  }

  onRemoveFormat = index => {
    const { onChange, formats } = this.props
    formats.splice(index, 1)

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
      <div>
        {formats.map((format, index) =>
          <FormatEdit
            index={index}
            item={format}
            key={index}
            onChange={this.onChangeFormat}
            onRemoveFormat={this.onRemoveFormat}
          />
        )}

        {this.renderNew()}
      </div>
    )
  }
}
