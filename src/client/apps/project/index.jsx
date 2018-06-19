import styled from 'styled-components'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { fetchItem, resetItem } from '../../actions/item'
import { Item } from '../../components/item/index.jsx'
import { Loading } from '../../components/layout/components/loading.jsx'
import { H1 } from '../../styles/text.jsx'

class Project extends Component {
  static propTypes = {
    fetchItemAction: PropTypes.func,
    isAuthenticated: PropTypes.bool,
    item: PropTypes.object,
    match: PropTypes.object,
    resetItemAction: PropTypes.func
  }

  componentWillMount = () => {
    const { fetchItemAction } = this.props
    const { id } = this.props.match.params

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
