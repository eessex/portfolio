import styled from 'styled-components'
import React, { Component } from 'react'
import { clone } from 'lodash'
import { Col, Row } from 'react-styled-flexboxgrid'
import { Select } from 'client/components/FormInputs/Select'
import { Input } from 'client/styles/forms'
import { Venue } from 'client/typings'

interface VenueEditProps {
  onChange: (val: Venue) => void
  venue?: Venue
}

interface VenueEditState {
  venue: Venue
}

export class VenueEdit extends Component<VenueEditProps, VenueEditState> {
  constructor (props) {
    super(props)
    const venue = props.venue || {}

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

  render () {
    const {
      address,
      city,
      country,
      name,
      state
    } = this.state.venue

    return (
      <VenueEditContainer>
        <Row>
          <Col xs={12} sm={6}>
            <Input
              placeholder='Venue Name'
              value={name || ''}
              onChange={(e) => this.onChange('name', e.target.value)}
              autoFocus
            />
          </Col>

          <Col xs={12} sm={6}>
            <Input
              placeholder='Address'
              value={address || ''}
              onChange={(e) => this.onChange('address', e.target.value)}
            />
          </Col>
        </Row>

        <Row>
          <Col xs={12} sm={4}>
            <Input
              placeholder='City'
              value={city || ''}
              onChange={(e) => this.onChange('city', e.target.value)}
            />
          </Col>

          <Col xs={12} sm={2}>
            <Select
              value={state || 0}
              states
              onChange={(key, value) => this.onChange('state', value)}
            />
          </Col>

          <Col xs={12} sm={6}>
            <Input
              placeholder='Country'
              value={country || ''}
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
    border-bottom: 1px solid ${({ theme }) => theme.colors.gray};
  }

  select {
    font-size: 1em;
    width: 100%;
  }

  ${Row} {
    &:first-child {
      margin: 10px 0 30px 0;
    }
    &:last-child {
      margin-left: 0;
      margin-right: 0;
    }
    ${Col} {
      padding-left: 0;
    }
  }
`
