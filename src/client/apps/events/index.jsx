import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { sortByDate } from 'client/utils'
import { ItemsList } from 'client/components/items_list'

export class Events extends Component {
  static propTypes = {
    items: PropTypes.array
  }

  render () {
    const { items } = this.props // createItem,
    const upcoming = sortByDate(items, 'start_date').upcoming.reverse()
    const past = sortByDate(items, 'start_date').past

    return (
      <div>
        {upcoming.length > 0 &&
          <ItemsList
            label='Upcoming Events'
            model='events'
            layout='grid'
            list={upcoming}
          />
        }
        {past.length > 0 &&
          <ItemsList
            label='Past Events'
            model='events'
            list={past}
            layout='table'
            canToggle
          />
        }
      </div>
    )
  }
}

const mapStateToProps = ({ itemsReducer }) => ({
  items: itemsReducer.list
})

export default connect(
  mapStateToProps
)(Events)
