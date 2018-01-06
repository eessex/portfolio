import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import React, { Component } from 'react'
import * as Actions from '../../actions/events'
import ComingSoon from '../../components/coming_soon.jsx'
import { ItemsList } from '../../components/items_list/index.jsx'
import { NewButton } from '../../components/header/components/new_button.jsx'
import { sortByDate } from '../../utils/index.js' 

class Events extends Component {
  constructor(props) {
    super(props)

    const isAdmin = props.user.isAuthenticated
    const query = isAdmin ? {} : { published: true }

    this.state = {
      isAdmin
    }
  }

  componentWillMount() {
    this.props.actions.fetchEvents(this.state.query)
  }

  render() {
    const { actions, events, settings } = this.props    
    const { isAdmin } = this.state
    const { loading } = settings
    const { list } = events

    const upcoming = sortByDate(list, 'start_date').upcoming
    const past = sortByDate(list, 'start_date').past

    return (
      <div className='Events'>
        {loading
          ? <div className='Loading' />

          : list.length > 0
            ? <div>

                {isAdmin &&
                  <NewButton
                    model='Event'
                    onCreate={actions.createEvent}
                  />
                }

                <div className='Events__body'>

                  {upcoming.length > 0 &&
                    <ItemsList
                      title='Upcoming Events'
                      model='events'
                      layout='grid'
                      list={upcoming.reverse()}
                    />
                  }

                  {past.length > 0 &&
                    <ItemsList
                      title='Past Events'
                      model='events'
                      list={past}
                      layout='table'
                    />
                  }

                </div>
              </div>

            : <ComingSoon label='Events' />
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
