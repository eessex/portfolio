import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import React, { Component } from 'react'
import * as Actions from '../../actions/events'
import { ItemsList } from '../../components/items_list/index.jsx'
import { Loading } from '../../components/layout/components/loading.jsx'
import { NewButton } from '../../components/header/components/new_button.jsx'
import { sortByDate } from '../../utils/index.js' 

class Events extends Component {
  state = {
    isAdmin: this.props.user.isAuthenticated,
  }

  componentWillMount() {
    const { isAdmin } = this.state
    const query = isAdmin ? {} : { published: true }

    this.props.actions.fetchEvents(query)
  }

  render() {
    const { actions, events, settings } = this.props    
    const { isAdmin, listStyle } = this.state
    const { loading } = settings
    const { list } = events

    const upcoming = sortByDate(list, 'start_date').upcoming
    const past = sortByDate(list, 'start_date').past

    return (
      <div className='Events'>
        {loading
          ? <Loading />

          : <div>
              {isAdmin &&
                <NewButton
                  model='Event'
                  onCreate={actions.createEvent}
                />
              }

              <div className='Events__body'>

                {upcoming.length > 0 &&
                  <ItemsList
                    label='Upcoming Events'
                    model='events'
                    layout='grid'
                    list={upcoming.reverse()}
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
            </div>
          }
      </div>
    )
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
)(Events)
