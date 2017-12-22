import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as Actions from '../../actions/publications'
import { ItemsList } from '../../components/items_list/index.jsx'
import { NewButton } from '../../components/header/components/new_button.jsx'
import { LayoutColumn } from '../../components/layout/column.jsx'

class Publications extends Component {
  constructor(props) {
    super(props)

    const isAdmin = props.user.isAuthenticated
    const query = isAdmin ? {} : {published: true}

    this.state = {
      query,
      isAdmin
    }
  }

  componentWillMount() {
    this.props.actions.fetchPublications(this.state.query)
  }

  render() {
    const { actions, match, publications, settings } = this.props
    const { isAdmin } = this.state
    const { loading } = settings
    const { list } = publications
    const label = match.path.replace('/','') === 'publications' ? 'Publications' : 'Releases'

    if (loading) {
      return (
        <div className='Loading' />
      )

    } else {
      return (
        <LayoutColumn
          className='Publications'
          label={label}
        >
          {isAdmin &&
            <NewButton
              model='Publication'
              onCreate={actions.createPublication}
            />
          }
          <ItemsList
            model='publications'
            list={list}
          />
        </LayoutColumn>
      )
    }
  }
}

const mapStateToProps = (state) => ({
  ...state
})

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(Actions, dispatch)
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Publications)
