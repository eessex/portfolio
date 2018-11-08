import styled from 'styled-components'
import PropTypes from 'prop-types'
import React from 'react'
// import { Social } from 'client/components/social/social_list'
import { Item as ViewItem } from 'client/components/item'

export const Info = props => {
  const { page } = props
  // const cover_image = images && images[0]

  return (
    <React.Fragment>
      <ViewItem
        item={page}
        label={page.title}
        labelLink
        model='page'
        editing={false}
      />
    </React.Fragment>
    //   {/* <SocialContainer>
    //     <Social social={social} />
    //   </SocialContainer> */}
  )
}

export const SocialContainer = styled.div`
  font-size: 90%;
  padding: 1em 0 4em;
`

Info.propTypes = {
  page: PropTypes.object
}
