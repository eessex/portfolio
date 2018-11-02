import { clone } from 'lodash'
import {
  CREATE_ITEM
} from '../actions'

import {
  FETCH_ITEMS_ERROR,
  FETCH_ITEMS_REQUESTED,
  FETCH_ITEMS_SUCCESS,
  RESET_ITEMS
} from 'client/actions/items2'

const initialState = {
  loading: false,
  list: []
}

export const itemsReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_ITEMS_REQUESTED:
      return Object.assign({}, state, {
        loading: true
      })

    case FETCH_ITEMS_SUCCESS: {
      return Object.assign({}, state, {
        list: action.payload.items,
        loading: false
      })
    }

    case FETCH_ITEMS_ERROR:
      return Object.assign({}, state, {
        loading: false,
        error: action.payload
      })

    case CREATE_ITEM.PENDING:
      return Object.assign({}, state, {
        loading: true
      })

    case CREATE_ITEM.SUCCESS:
      const list = clone(state.list)
      list.push(action.payload.data)

      return Object.assign({}, state, {
        list,
        error: null
      })

    case CREATE_ITEM.ERROR:
      return Object.assign({}, state, {
        loading: false,
        error: action.payload
      })
    case RESET_ITEMS:
      return Object.assign({}, state, {
        loading: false,
        list: []
      })
    default:
      return state
  }
}
