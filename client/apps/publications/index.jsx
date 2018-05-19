import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { filter } from 'lodash'
import * as itemsActions from '../../actions/items'
import { sortByDate } from '../../utils/index.js'
import { ItemsList } from '../../components/items_list/index.jsx'
import { NewButton } from '../../components/header/components/new_button.jsx'
import { LayoutColumn } from '../../components/layout/column.jsx'
import { Loading } from '../../components/layout/components/loading.jsx'

class Publications extends Component {
  static propTypes = {
    createItem: PropTypes.func,
    fetchItems: PropTypes.func,
    items: PropTypes.object,
    user: PropTypes.object
  }

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
    const { fetchItems } = this.props
    const { query } = this.state

    fetchItems('publications', query)
  }
  
  getReleases = (compilation=false) => {
    const { list } = this.props.items
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
    const {
      createItem,
      items: { list, loading },
      match: { path }
    } = this.props
    const { isAdmin } = this.state

    const model = path.split('/')[1]
    const label = model === 'publications' ? 'Publications' : 'Releases'

    const releases = this.getReleases()
    const compilations = this.getReleases(true)

    return (
      <div className='Publications'>
        {loading
          ? <Loading />

          : <div>
              {isAdmin &&
                <NewButton
                  model='Publication'
                  onCreate={() => createItem('publications')}
                />
              }
              {releases &&
                <ItemsList
                  model={label.toLowerCase()}
                  list={releases}
                  label={label}
                  layout='table'
                  className={`Publications__${label.toLowerCase()}`}
                  canToggle
                />
              }
              {compilations &&
                <ItemsList
                  model={label.toLowerCase()}
                  list={compilations}
                  label='Compilations'
                  layout='table'
                  className='Publications__compilations'
                  canToggle
                />
              }
          </div>
        }
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  items: state.items,
  user: state.user
})

const mapDispatchToProps = {
  createItem: itemsActions.createItem,
  fetchItems: itemsActions.fetchItems
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Publications)
