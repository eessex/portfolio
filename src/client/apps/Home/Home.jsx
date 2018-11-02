import styled from 'styled-components'
import PropTypes from 'prop-types'
import React from 'react'
import { ColumnContainer } from 'client/components/layout/column'

export const Home = props => {
  const { description, images } = props.page
  const backgroundImg = images && images[0] && images[0].url

  return (
    <ColumnContainer>
      {backgroundImg &&
        <PageBackground backgroundImg={backgroundImg} />
      }
      {description &&
        <PageDescription dangerouslySetInnerHTML={{__html: description}} />
      }
    </ColumnContainer>
  )
}

const PageBackground = styled.div`
  background-color: orange;
  ${props => props.backgroundImg && `
    background: url(${props.backgroundImg});
    background-position: center;
    background-size: cover;
  `}
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  z-index: -1;
`

const PageDescription = styled.div`
  max-width: 500px;
  font-size: 2em;
  line-height: 1.15em;
`

Home.propTypes = {
  page: PropTypes.object
}
