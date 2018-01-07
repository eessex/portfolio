import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Col, Row } from 'react-styled-flexboxgrid'
import { SelectInput } from '../../../../components/forms/select_input.js'
import { PlainText } from '../../../../components/forms/rich_text/plain_text.jsx'
import { CheckboxInput } from '../../../../components/forms/checkbox_input.jsx'

export class EditFormat extends Component {
  static propTypes = {
    index: PropTypes.number,
    item: PropTypes.object,
  }

  constructor(props) {
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
  }

  saveItem = () => {
    const { index, onChange } = this.props
    const { item } = this.state
    onChange(this.state.item, index)
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
      <Row className='EditFormat h5'>
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
          >Save</button>
        }
      </Row>
    )
  }
}
