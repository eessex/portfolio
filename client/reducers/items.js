import {
  FETCH_ITEMS,
  CREATE_ITEM
} from '../actions'

const initialState = {
  loading: false,
  list: []
}

const itemsReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_ITEMS.PENDING:
      return Object.assign({}, state, {
        loading: true
      })

    case FETCH_ITEMS.SUCCESS:
      return Object.assign({}, state, {
        loading: false,
        list: action.payload
      })

    case FETCH_ITEMS.ERROR:
      return Object.assign({}, state, {
        loading: false
      })

    case CREATE_ITEM.PENDING:
      return Object.assign({}, state, {
        loading: true
      })

    case CREATE_ITEM.SUCCESS:
      state.list.push(action.payload.item)

      return Object.assign({}, state, {
        loading: false,
        list: state.list,
        error: null
      })

    case CREATE_ITEM.ERROR:
      return Object.assign({}, state, {
        loading: false,
        error: action.payload
      })

    default:
      return state
  }
}

export default itemsReducer
