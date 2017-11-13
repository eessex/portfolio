import {
  FETCH_EVENTS,
  CREATE_EVENT
} from '../actions'

const initialState = {
  loading: false,
  list: []
}

const eventsReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_EVENTS.PENDING:
      return Object.assign({}, state, {
        loading: true
      })

    case FETCH_EVENTS.SUCCESS:
      return Object.assign({}, state, {
        loading: false,
        list: action.payload
      })

    case FETCH_EVENTS.ERROR:
      return Object.assign({}, state, {
        loading: false
      })

    case CREATE_EVENT.PENDING:
      debugger
      return Object.assign({}, state, {
        loading: true
      })

    case CREATE_EVENT.SUCCESS:
    state.list.push(action.payload.event)

    return Object.assign({}, state, {
      loading: false,
        list: state.list,
        error: null
      })

    case CREATE_EVENT.ERROR:
      return Object.assign({}, state, {
        loading: false,
        error: action.payload.data
      })

    default:
      return state
  }
}

export default eventsReducer
