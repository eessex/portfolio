import { clone } from 'lodash'
import {
  CHANGE_ITEM,
  DELETE_ITEM,
  FETCH_UPLOAD,
  RESET_UPLOAD,
  UPDATE_ITEM
} from '../actions'

import {
  FETCH_ITEM_ERROR,
  FETCH_ITEM_REQUESTED,
  FETCH_ITEM_SUCCESS,
  RESET_ITEM
} from '../actions/item'

export const initialState = {
  item: {},
  isSaved: true,
  isSaving: false,
  loading: false,
  uploading: false,
  upload: {}
}

export const itemReducer = (state = initialState, action) => {
  switch (action.type) {
    case CHANGE_ITEM: {
      const item = clone(state.item)
      const { key, value } = action.payload

      item[key] = value
      return Object.assign({}, state, {
        item,
        isSaved: false,
        isSaving: !item.published
      })
    }

    case FETCH_ITEM_REQUESTED: {
      return Object.assign({}, state, {
        loading: true
      })
    }

    case FETCH_ITEM_SUCCESS:
      const { payload, model } = action

      return Object.assign({}, state, {
        item: payload.item,
        loading: false,
        model,
        error: null
      })

    case FETCH_ITEM_ERROR:
      return Object.assign({}, state, {
        loading: false,
        error: action.payload.error
      })

    case UPDATE_ITEM.PENDING:
      return Object.assign({}, state, {
        isSaving: true
      })

    case UPDATE_ITEM.SUCCESS:
      return Object.assign({}, state, {
        error: null,
        item: action.payload,
        isSaved: true,
        isSaving: false
      })

    case UPDATE_ITEM.ERROR:
      return Object.assign({}, state, {
        isSaving: false,
        error: action.payload
      })

    case DELETE_ITEM.PENDING:
      return Object.assign({}, state, {
        loading: true
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
        item: {},
        isSaved: true,
        isSaving: false,
        loading: false,
        uploading: false,
        error: null,
        model: null
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
