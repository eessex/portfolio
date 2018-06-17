import styled from 'styled-components'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { filter, sortBy } from 'lodash'
import * as itemsActions from '../../actions/items'
import { ItemsList } from '../../components/items_list/index.jsx'
import { NewButton } from '../../components/header/components/new_button.jsx'
import { Loading } from '../../components/layout/components/loading.jsx'

class Publications extends Component {
  static propTypes = {
    createItem: PropTypes.func,
    fetchItems: PropTypes.func,
    items: PropTypes.object,
    match: PropTypes.object,
    user: PropTypes.object
  }

  constructor (props) {
    super(props)

    const isAdmin = props.user.isAuthenticated
    const query = isAdmin ? {} : {published: true}

    this.state = {
      query,
      isAdmin
    }
  }

  componentWillMount () {
    const { fetchItems } = this.props
    const { query } = this.state

    fetchItems('publications', query)
  }
  
  getReleases = (compilation = false) => {
    const { list } = this.props.items
    let releases = []

    list.map((item) => {
      let isDraft = !item.formats.length && !compilation
      const sorted = filter(item.formats, { compilation: compilation })

      if (isDraft || sorted.length) {
        releases.push(item)
      }
    })

    const sortedReleases = sortBy(releases, [
      (item) => {
        if (item.formats.length) {
          return item.formats[0].release_year
        }
      },
      'name'
    ]).reverse()

    return sortedReleases
  }

  render () {
    const {
      createItem,
      items: { loading },
      match: { path }
    } = this.props
    const { isAdmin } = this.state

    const model = path.split('/')[1]
    const label = model === 'publications' ? 'Publications' : 'Releases'

    const releases = this.getReleases()
    const compilations = this.getReleases(true)

    return (
      <div>
        {loading
          ? <Loading />
          : (
            <div>
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
                  canToggle
                />
              }
              {compilations &&
                <Compilations>
                  <ItemsList
                    model={label.toLowerCase()}
                    list={compilations}
                    label='Compilations'
                    layout='table'
                    canToggle
                  />
                </Compilations>
              }
            </div>
          )
        }
      </div>
    )
  }
}

const Compilations = styled.div`
  margin-top: 5em;
`

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
