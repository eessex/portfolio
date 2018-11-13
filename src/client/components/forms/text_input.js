import styled from 'styled-components'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { PlainText } from 'client/components/text/draft/PlainText'

export class TextInput extends Component {
  static propTypes = {
    index: PropTypes.number,
    inline: PropTypes.bool,
    label: PropTypes.string,
    maxLength: PropTypes.number,
    name: PropTypes.string.isRequired,
    onChange: PropTypes.func,
    placeholder: PropTypes.string,
    required: PropTypes.bool,
    size: PropTypes.any,
    textarea: PropTypes.bool,
    value: PropTypes.string
  }

  onChange = value => {
    const { index, name, onChange } = this.props

    if (index || index === 0) {
      onChange(name, value, index)
    } else {
      onChange(name, value)
    }
  }

  renderLabel = () => {
    const { label, name } = this.props
    const text = (label && label.length > 0) ? label : name

    return <label>{text}</label>
  }

  renderPlaceholder = () => {
    const { name, placeholder } = this.props

    if (placeholder) {
      return placeholder
    } else {
      return name.replace(/-/g, ' ').replace(/_/g, ' ')
    }
  }

  render () {
    const {
      inline,
      label,
      maxLength,
      name,
      value,
      required,
      size,
      textarea
    } = this.props

    return (
      <TextInputContainer
        inline={inline}
        required={required}
      >
        {label &&
          this.renderLabel()
        }
        {textarea
          ? (
            <PlainText
              required={required || false}
              placeholder={this.renderPlaceholder()}
              size={size}
              maxLength={maxLength}
              content={value}
              onChange={this.onChange}
            />
          ) : (
            <Input
              required={required || false}
              placeholder={this.renderPlaceholder()}
              name={name}
              size={size}
              maxLength={maxLength}
              defaultValue={value}
              onChange={(e) => this.onChange(e.target.value)}
            />
          )
        }
      </TextInputContainer>
    )
  }
}

export const TextInputContainer = styled.div`
  display: flex;
  flex-direction: ${props => props.inline ? 'row' : 'column'};

  .plain-text {
    border-bottom: 1px solid silver;
    padding: 5px 0;
  }

  ${props => !props.inline && `
    label { 
      margin-bottom: 5px;
    }
  `}
`

export const Input = styled.input`
  border-bottom: 1px solid silver;
  font-size: 1em;
  padding: 5px 0;
  border-top: none;
  border-left: none;
  border-right: none;
`
