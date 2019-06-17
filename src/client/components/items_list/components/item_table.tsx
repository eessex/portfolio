import React from 'react'
import { Col, Row } from 'react-styled-flexboxgrid'
import { Formats, FormatsContainer } from 'client/components/formats/formats'
import { H4 } from 'client/styles/text'
import styled from 'styled-components'
import { ListItemProps } from 'client/typings'

export const ItemTable: React.SFC<ListItemProps> = props => {
  const { artist, date, formats, title, venue } = props

  return (
    <TableItem>
      {date &&
        <Col xs={12} lg={3}>
          <H4>{date}</H4>
        </Col>
      }
      <Col xs={12} lg={6}>
        <Title>
          {artist && `${artist}: `}
          {title || 'Missing Title'}
        </Title>
      </Col>
      {venue &&
        <Col xs={12} lg={3}>
          <H4>{venue}</H4>
        </Col>
      }
      {formats && formats.length &&
        <Col xs={12} lg={3}>
          <H4>
            <Formats formats={formats} isShort />
          </H4>
        </Col>
      }
    </TableItem>
  )
}

const Title = styled(H4)`
  @media (max-width: 76em) {
    max-width: 100%;
    font-size: 1.3em;
    line-height: 1.3em;
  }
`

const TableItem = styled(Row)`
  margin-left: 0;
  margin-right: 0;
  padding: 12px 20px;

  ${Col} {
    padding-left: 0;
    padding-right: 0;
  }

  @media (max-width: 76rem) {
    ${FormatsContainer} {
      flex-direction: column;
    }
  }
`
