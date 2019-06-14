import React, { Component } from 'react'
import { Button } from 'client/components/Button'
import { FormatEdit } from '../format/format_edit'
import { Format as FormatType } from 'client/typings'

export interface FormatsEditProps {
  formats: FormatType[]
  onChange: (key: string, val: FormatType[]) => void
}

interface FormatsEditState {
  showNewForm: boolean
}

export class FormatsEdit extends Component<FormatsEditProps, FormatsEditState> {
  state = {
    showNewForm: this.props.formats.length === 0
  }

  onChangeFormat = (format: FormatType, index: number) => {
    const { onChange, formats } = this.props

    formats[index] = format
    onChange('formats', formats)
  }

  onNewFormat = (format: FormatType) => {
    const { onChange, formats } = this.props

    formats.push(format)
    onChange('formats', formats)
    this.setState({ showNewForm: false })
  }

  onRemoveFormat = (index: number) => {
    const { onChange, formats } = this.props
    formats.splice(index, 1)

    onChange('formats', formats)
    this.setState({ showNewForm: false })
  }

  renderNew = () => {
    if (this.state.showNewForm) {
      return <FormatEdit onChange={this.onNewFormat} />
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
    return (
      <div>
        {this.props.formats.map((format, index) =>
          <FormatEdit
            index={index}
            format={format}
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
