import {
  FETCH_PAGE_ERROR,
  FETCH_PAGE_REQUESTED,
  FETCH_PAGE_SUCCESS,
  RESET_PAGE
} from 'client/actions/page'

const initialState = {
  loading: false,
  page: {}
}

export const pageReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_PAGE_REQUESTED:
      return Object.assign({}, state, {
        loading: true
      })

    case FETCH_PAGE_SUCCESS: {
      return Object.assign({}, state, {
        page: action.payload.page,
        loading: false
      })
    }

    case FETCH_PAGE_ERROR:
      return Object.assign({}, state, {
        loading: false,
        error: action.payload
      })

    case RESET_PAGE:
      return Object.assign({}, state, {
        loading: false,
        page: {}
      })

    default:
      return state
  }
}
