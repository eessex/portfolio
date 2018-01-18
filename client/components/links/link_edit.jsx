import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Row, Col } from 'react-styled-flexboxgrid'
import { Button } from '../forms/buttons/button.jsx'

export class LinkEdit extends Component {
  static propTypes = {
    autoFocus: PropTypes.bool,
    index: PropTypes.number,
    onChange: PropTypes.func.isRequired,
    onDelete: PropTypes.func,
    title: PropTypes.string,
    url: PropTypes.string
  }

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

    if (index) {
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
      <Row className='LinkEdit'>
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
            ? <Button
                borderless
                icon='ban'
                onClick={() => onDelete(index)}
              />
            : <Button
                className='new'
                text='save'
                onClick={this.onNew}
              />
          }
        </Col>
      </Row>
    )
  }
}
