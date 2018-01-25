import {
  DELETE_ITEM,
  FETCH_ITEM,
  FETCH_UPLOAD,  
  RESET_ITEM,
  RESET_UPLOAD,
  UPDATE_ITEM  
} from '../actions'

const initialState = {
  item: {},
  loading: false,
  uploading: false,
  saving: false,
  upload: {}
}

const itemReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_ITEM.PENDING:
      return Object.assign({}, state, {
        loading: true
      })

    case FETCH_ITEM.SUCCESS:
      return Object.assign({}, state, {
        loading: false,
        item: action.payload
      })

    case FETCH_ITEM.ERROR:
      return Object.assign({}, state, {
        loading: false
      })

    case UPDATE_ITEM.PENDING:
      return Object.assign({}, state, {
        saving: true,
        item: state.item
      })

    case UPDATE_ITEM.SUCCESS:
      return Object.assign({}, state, {
        saving: false,
        item: action.payload.item,
        error: null
      })

    case UPDATE_ITEM.ERROR:
      return Object.assign({}, state, {
        saving: false,
        error: action.payload.data,
        item: state.item
      })

    case DELETE_ITEM.PENDING:
      return Object.assign({}, state, {
        loading: true,
        item: state.item
      })

    case DELETE_ITEM.SUCCESS:
      return Object.assign({}, state, {
        loading: true
      })

    case DELETE_ITEM.ERROR:
      return Object.assign({}, state, {
        loading: false,
        item: state.item
      })

    case RESET_ITEM:
      return Object.assign({}, state, {
        loading: false,
        uploading: false,
        item: state.item
      })

    case FETCH_UPLOAD.PENDING:
      return Object.assign({}, state, {
        uploading: true
      })

    case FETCH_UPLOAD.SUCCESS:
      return Object.assign({}, state, {
        uploading: false,
        upload: action.payload
      })

    case FETCH_UPLOAD.ERROR:
      return Object.assign({}, state, {
        uploading: false
      })
    case RESET_UPLOAD:
      return initialState

    default:
      return state
  }
}

export default itemReducer