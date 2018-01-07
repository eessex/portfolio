import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as Actions from '../../actions/publications'
import { ItemsList } from '../../components/items_list/index.jsx'
import { NewButton } from '../../components/header/components/new_button.jsx'
import { LayoutColumn } from '../../components/layout/column.jsx'
import { filter } from 'lodash'

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

  getReleases = (compilation=false) => {
    const { list } = this.props.publications
    let sortedReleases = []

    list.map((item, i) => {
      const sorted = filter(item.formats, { compilation: compilation })
      if (sorted.length) {
        sortedReleases.push(item)
      }
    })
    return sortedReleases
  }

  render() {
    const { actions, match, publications, settings } = this.props
    const { isAdmin } = this.state
    const { loading } = settings
    const { list } = publications
    const label = match.path.replace('/','') === 'publications' ? 'Publications' : 'Releases'
    const compilations = this.getReleases(true)

    if (loading) {
      return (
        <div className='Loading' />
      )

    } else {
      return (
        <div
          className='Publications'
        >
          {isAdmin &&
            <NewButton
              model='Publication'
              onCreate={actions.createPublication}
            />
          }
          <ItemsList
            model={label.toLowerCase()}
            list={this.getReleases()}
            label={label}
            layout='table'
            className={`Publications__${label.toLowerCase()}`}
          />
          {compilations &&
            <ItemsList
              model={label.toLowerCase()}
              list={compilations}
              label='Compilations'
              layout='table'
              className='Publications__compilations'
            />
          }
        </div>
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
