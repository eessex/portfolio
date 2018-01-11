import styled from 'styled-components'
import React, { Component } from 'react'
import { clone } from 'lodash'
import { Col, Row } from 'react-styled-flexboxgrid'
import { SelectInput } from '../forms/select_input.js'

export class VenueEdit extends Component {
  constructor(props) {
    super(props)
    const { venue } = this.props

    this.state = {
      venue: {
        name: venue.name || null,
        address: venue.address || null,
        city: venue.city || null,
        state: venue.state || null,
        country: venue.country || null
      }
    }
  }

  onChange = (key, value) => {
    const { onChange } = this.props
    const venue = clone(this.state.venue)

    venue[key] = value
    this.setState({ venue })
    onChange(venue)
  }

  render() {
    const {
      address,
      city,
      country,
      name,
      state
    } = this.state.venue

    return (
      <VenueEditContainer className='VenueEdit'>
        <Row>
          <Col xs={12} sm={6}>
            <input
              placeholder='Venue Name'
              value={name ? name : ''}
              onChange={(e) => this.onChange('name', e.target.value)}
            />
          </Col>

          <Col xs={12} sm={6}>
            <input
              placeholder='Address'
              value={address ? address : ''}
              onChange={(e) => this.onChange('address', e.target.value)}
            />
          </Col>
        </Row>

        <Row>
          <Col xs={12} sm={4}>
            <input
              placeholder='City'
              value={city ? city : ''}
              onChange={(e) => this.onChange('city', e.target.value)}
            />
          </Col>

          <Col xs={12} sm={2}>
            <SelectInput
              value={state ? state : 0}
              states
              onChange={(key, value) => this.onChange('state', value)}
            />
          </Col>

          <Col xs={12} sm={6}>
            <input
              placeholder='Country'
              value={country ? country : ''}
              onChange={(e) => this.onChange('country', e.target.value)}
            />
          </Col>
        </Row>

      </VenueEditContainer>
    )
  }
}

const VenueEditContainer = styled.div`
  input {
    font-size: 1em;
    width: 100%;
    border: none;
    border-bottom: 1px solid silver;
  }

  select {
    font-size: 1em;
    width: 100%;
  }

  div[class*="Row-"]:first-child {
    margin: 10px 0 30px 0;
  }

  div[class*="Row-"] div[class^="Col-"] {
    padding-left: 0;
  }
`