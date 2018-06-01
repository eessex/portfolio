import styled from 'styled-components'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Col, Row } from 'react-styled-flexboxgrid'
import { SelectInput } from '../forms/select_input.js'
import { CheckboxInput } from '../forms/checkbox_input.jsx'

export class FormatEdit extends Component {
  static propTypes = {
    index: PropTypes.number,
    item: PropTypes.object
  }

  constructor (props) {
    super(props)

    const {
      compilation,
      featuring,
      format,
      publisher,
      release_year
    } = props.item

    this.state = {
      item: {
        compilation: compilation || false,
        featuring: featuring || false,
        format: format || '',
        publisher: publisher || '',
        release_year: release_year || null
      },
      needsSave: false
    }
  }

  onChangeFormat = (key, value) => {
    const { index, item, onChange } = this.props
    const needsSave = true

    item[key] = value
    this.setState({ item, needsSave })
    onChange(item, index)
  }

  saveItem = () => {
    const { index, onChange } = this.props
    const { item } = this.state

    onChange(item, index)
  }

  render () {
    const { index } = this.props
    const { item, needsSave } = this.state
    const {
      compilation,
      featuring,
      format,
      publisher,
      release_year
    } = item

    return (
      <FormatEditContainer className='FormatEdit h5'>
        <Row>
          <Col>
            <SelectInput
              name='format'
              value={format}
              options={['LP', '2xLP', 'Cassette', '2xCassette', 'Digital']}
              onChange={(key, value) => this.onChangeFormat(key, value)}
            />
          </Col>
          <Col>
            <input
              placeholder='YYYY'
              maxLength='4'
              name='release_year'
              defaultValue={release_year}
              onChange={(e) => {
                this.onChangeFormat('release_year', parseInt(e.target.value))
              }}
            />
          </Col>
          <Col>
            <input
              placeholder='publisher'
              defaultValue={publisher}
              onChange={(e) => this.onChangeFormat('publisher', e.target.value)}
            />
          </Col>
          <Col>
            <CheckboxInput
              label='Compilation'
              value={compilation}
              onChange={() => this.onChangeFormat('compilation', !compilation)}
            />
          </Col>
          <Col>
            <CheckboxInput
              label='Featuring'
              value={featuring}
              onChange={() => this.onChangeFormat('featuring', !featuring)}
            />
          </Col>
          {!index && index !== 0 &&
            <button
              style={{color: needsSave ? 'red' : 'black'}}
              onClick={this.saveItem}
            >
              Save
            </button>
          }
        </Row>
      </FormatEditContainer>
    )
  }
}

const FormatEditContainer = styled.div`
  ${Row} {
    margin: 0;
    padding: 0 0 10px 0;
  }
  ${Col} {
    padding-left: 0 !important;
    padding-right: 10px !important;
  }
  input[name='release_year'] {
    width: 3em;
  }
  input {
    border-bottom: 1px solid #ddd;
    border-left: 0;
    border-right: 0;
    border-top: 0;
    padding-bottom: 2px;
    font-size: 1em;
  }
`

FormatEdit.propTypes = {
  index: PropTypes.number,
  item: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired
}
