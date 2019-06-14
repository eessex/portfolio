import styled from 'styled-components'
import React, { Component } from 'react'
import { Col, Row } from 'react-styled-flexboxgrid'
import { Button } from 'client/components/Button'
import { Checkbox } from 'client/components/FormInputs/Checkbox'
import { Select } from 'client/components/FormInputs/Select'
import { Input } from 'client/styles/forms'
import { Format as FormatType } from 'client/typings'

interface FormatEditProps {
  format?: FormatType
  index?: number
  onChange: (format: FormatType, i?: number) => void
  onRemoveFormat?: (i: number) => void
}

interface FormatEditState {
  format: FormatType
  needsSave: boolean
}


export class FormatEdit extends Component<FormatEditProps, FormatEditState>  {
  constructor (props) {
    super(props)

    const {
      compilation,
      featuring,
      publisher,
      release_year
    } = props.format || {} as FormatType

    this.state = {
      format: {
        compilation: compilation || false,
        featuring: featuring || false,
        format: props.format && props.format.format || '',
        publisher: publisher || '',
        release_year: release_year || null
      },
      needsSave: false
    }
  }

  onChangeFormat = (key, value) => {
    const { format } = this.props
    const needsSave = true

    format[key] = value
    this.setState({ format, needsSave })
  }

  saveFormat = () => {
    const { index, onChange } = this.props
    const { format } = this.state
    const needsSave = false

    this.setState({ needsSave })
    onChange(format, index)
  }

  render () {
    const { format, needsSave } = this.state
    const { onRemoveFormat, index } = this.props
    const {
      compilation,
      featuring,
      publisher,
      release_year
    } = format

    return (
      <FormatEditContainer>
        <Row>
          <Col>
            <Select
              name='format'
              value={format.format}
              options={['LP', '2xLP', 'Cassette', '2xCassette', 'CD', '2xCD', 'Digital']}
              onChange={(key, value) => this.onChangeFormat(key, value)}
            />
          </Col>
          <Col>
            <Input
              placeholder='YYYY'
              maxLength={4}
              name='release_year'
              defaultValue={release_year && release_year.toString()}
              onChange={(e) => {
                this.onChangeFormat('release_year', parseInt(e.target.value))
              }}
            />
          </Col>
          <Col>
            <Input
              placeholder='publisher'
              defaultValue={publisher}
              onChange={(e) => this.onChangeFormat('publisher', e.target.value)}
            />
          </Col>
          <Col>
            <Checkbox
              label='Compilation'
              value={compilation}
              onChange={() => this.onChangeFormat('compilation', !compilation)}
            />
          </Col>
          <Col>
            <Checkbox
              label='Featuring'
              value={featuring}
              onChange={() => this.onChangeFormat('featuring', !featuring)}
            />
          </Col>
          <Col>
            <Button
              color={needsSave ? 'red' : 'black'}
              onClick={this.saveFormat}
              text='save'
            />

            {onRemoveFormat &&
              <Button
                borderless
                icon='ban'
                onClick={() => onRemoveFormat(index)}
              />
            }
          </Col>
        </Row>
      </FormatEditContainer>
    )
  }
}

const FormatEditContainer = styled.div`
  ${Row} {
    margin: 0;
    padding: 0 0 10px 0;
    flex-wrap: nowrap;
  }
  ${Col} {
    padding-left: 0 !important;
    padding-right: 10px !important;
  }
  input[name='release_year'] {
    width: 3em;
  }
`
