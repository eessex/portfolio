import React, { Component } from 'react'
import { Row, Col } from 'react-styled-flexboxgrid'
import { Button } from 'client/components/Button'
import { Link } from 'client/typings'
import styled from 'styled-components'

interface LinkEditProps extends Link {
  autoFocus?: boolean
  index?: number
  onChange: (link: Link, i?: number) => void
  onDelete?: (i: number) => void
}

interface LinkEditState {
  link: Link
}

export class LinkEdit extends Component<LinkEditProps, LinkEditState> {
  state = {
    link: {
      title: this.props.title || '',
      url: this.props.url || ''
    }
  }

  onChange = (key, value) => {
    const { index, onChange } = this.props
    const { link } = this.state

    link[key] = value
    this.setState({ link })
    if (index || index === 0) {
      onChange(link, index)
    }
  }

  onNew = () => {
    const { link } = this.state
    const { onChange } = this.props

    if (link.url.length) {
      onChange(link)
      this.setState({
        link: {
          title: '',
          url: ''
        }
      })
    }
  }

  render () {
    const { title, url } = this.state.link
    const { autoFocus, index, onDelete } = this.props

    return (
      <LinkEditContainer>
        <Col sm={5}>
          <input
            autoFocus={autoFocus}
            placeholder='Title'
            value={title}
            onChange={(e) => this.onChange('title', e.target.value)}
          />
        </Col>
        <Col sm={5}>
          <input
            placeholder='http://example.com'
            value={url}
            onChange={(e) => this.onChange('url', e.target.value)}
          />
        </Col>
        <Col sm={1}>
          {(index || index === 0)
            ? (
              <Button
                borderless
                icon='ban'
                onClick={() => onDelete(index)}
              />
            ) : (
              <Button
                className='new'
                text='save'
                onClick={this.onNew}
              />
            )
          }
        </Col>
      </LinkEditContainer>
    )
  }
}

const LinkEditContainer = styled(Row)`
  padding-bottom: 20px !important;
  justify-content: flex-start !important;

  div[class^="Col-"] {
    padding-left: 0 !important;
    &:last-child {
      padding-left: 10px !important;
    }
  }

  input {
    font-size: .9em;
    width: 100%;
    border: none;
    border-bottom: 1px solid;
  }

  button {
    padding: 0;
    font-size: 1.15em;
    transition: color .3s;
    &:hover {
      color: red;
    }
  }

  button.new {
    font-size: .7em;
    margin-top: -5px;
    padding: 5px 10px;
    text-transform: uppercase;
    &:hover {
      color: limegreen;
    }
  }
`
