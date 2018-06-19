import styled from 'styled-components'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { fetchItem, resetItem } from 'client/actions/item'
import { Item } from 'client/components/item'
import { Loading } from 'client/components/layout/components/loading'
import { H1 } from 'client/styles/text'

class Project extends Component {
  static propTypes = {
    fetchItemAction: PropTypes.func,
    isAuthenticated: PropTypes.bool,
    item: PropTypes.object,
    match: PropTypes.object,
    resetItemAction: PropTypes.func
  }

  componentWillMount = () => {
    const { fetchItemAction, match } = this.props
    const { id } = match.params

    fetchItemAction('projects', id)
  }

  componentWillUnmount = () => {
    this.props.resetItemAction()
  }

  render () {
    const { isAuthenticated } = this.props
    const { item, loading } = this.props.item

    return (
      <ProjectContainer>
        {loading
          ? <Loading />
          : (
            <Item
              item={item}
              label='Project'
              labelLink
              model='projects'
              editing={isAuthenticated}
            />
          )
        }
      </ProjectContainer>
    )
  }
}

const ProjectContainer = styled.div`
  ${H1} {
    font-size: 3em;
    margin-top: -5px;
  }
`

const mapStateToProps = (state) => ({
  item: state.item,
  isAuthenticated: state.user.isAuthenticated
})

const mapDispatchToProps = {
  fetchItemAction: fetchItem,
  resetItemAction: resetItem
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Project)
