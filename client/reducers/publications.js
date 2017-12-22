import { FETCH_PUBLICATIONS, CREATE_PUBLICATION } from '../actions'

const initialState = {
  loading: false,
  list: []
}

const publicationsReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_PUBLICATIONS.PENDING:
      return Object.assign({}, state, {
        loading: true
      })

    case FETCH_PUBLICATIONS.SUCCESS:
      return Object.assign({}, state, {
        loading: false,
        list: action.payload
      })

    case FETCH_PUBLICATIONS.ERROR:
      return Object.assign({}, state, {
        loading: false
      })

    case CREATE_PUBLICATION.PENDING:
      return Object.assign({}, state, {
        loading: true,
      })

    case CREATE_PUBLICATION.SUCCESS:
      state.list.push(action.payload.publication)

      return Object.assign({}, state, {
        loading: false,
        list: state.list,
        error: null
      })

    case CREATE_PUBLICATION.ERROR:
      return Object.assign({}, state, {
        loading: false,
        error: action.payload,
      })

    default:
      return state
  }
}

export default publicationsReducer
