import PropTypes from 'prop-types'
import React from 'react'
import { Col, Row } from 'react-styled-flexboxgrid'
import { ShowFormats } from '../../../apps/publication/components/show/show_formats.jsx'

export const ItemTable = (props) => {
  const { artist, date, formats, title, venue, publisher } = props

  return (
    <Row className='Item ItemTable'>
      {date &&
        <Col sm={12} lg={3} className='Item__date'>
          <h4>{date}</h4>
        </Col>
      }
      <Col sm={12} lg={6} className='Item__title'>
        <h4>
          {artist && `${artist}: `}
          {title || 'Missing Title'}
        </h4>
      </Col>
      {venue &&
        <Col sm={12} lg={3} className='Item__venue'>
          <h4>{venue}</h4>
        </Col>
      }
      {formats && formats.length &&
        <Col sm={12} lg={3} className='Item__venue'>
          <h4>
            <ShowFormats items={formats} short />
          </h4>
        </Col>
      }
    </Row>
  )
}

ItemTable.propTypes = {
  artist: PropTypes.string,
  date: PropTypes.string,
  formats: PropTypes.array,
  title: PropTypes.string,
  venue: PropTypes.string,
  publisher: PropTypes.string
}
