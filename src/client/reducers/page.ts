import {
  FETCH_PAGE_ERROR,
  FETCH_PAGE_REQUESTED,
  FETCH_PAGE_SUCCESS,
  RESET_PAGE
} from 'client/actions/page'
import { Error, Item } from 'client/typings'

export interface PageInitialState {
  error: null | Error
  loading: boolean
  page: Item
}

export const initialState: PageInitialState = {
  loading: false,
  error: null,
  page: {} as Item
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
        error: null,
        loading: false
      })
    }

    case FETCH_PAGE_ERROR:
      return Object.assign({}, state, {
        loading: false,
        error: action.payload.error
      })

    case RESET_PAGE:
      return Object.assign({}, state, {
        loading: false,
        error: null,
        page: {}
      })

    default:
      return state
  }
}
