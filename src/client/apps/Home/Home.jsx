import styled from 'styled-components'
import PropTypes from 'prop-types'
import React from 'react'
import { ColumnContainer } from 'client/components/layout/column'

export const Home = props => {
  const { description, images } = props.page
  const backgroundImg = images && images[0] && images[0].url

  return (
    <HomeContainer>
      {backgroundImg &&
        <PageBackground backgroundImg={backgroundImg} />
      }
      {description &&
        <PageDescription dangerouslySetInnerHTML={{__html: description}} />
      }
    </HomeContainer>
  )
}

const HomeContainer = styled(ColumnContainer)`
  align-items: flex-end;
  align-self: flex-end;
  height: 100%;
  margin: 0;
  text-shadow: 0.015em 0.015em 0.05em #fff;
`

const PageBackground = styled.div`
  background-color: silver;
  ${props => props.backgroundImg && `
    background-color: white;
    background: url(${props.backgroundImg});
    background-position: center;
    background-size: cover;
    opacity: .45;
    @media (max-width: 46rem) {
      background-position: right;
    }
  `}
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  z-index: -1;
`

const PageDescription = styled.div`
  max-width: 70%;
  font-size: 1.85em;
  line-height: 1.25em;

  @media (max-width: 46rem) {
    max-width: 85%;
    font-size: 1.65em;
  }
`

Home.propTypes = {
  page: PropTypes.object
}
