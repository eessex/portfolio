import { UPDATE_SETTINGS } from '../actions'
import {
  FETCH_SETTINGS_ERROR,
  FETCH_SETTINGS_REQUESTED,
  FETCH_SETTINGS_SUCCESS,
  RESET_SETTINGS
} from 'client/actions/settings'
import { Error, Settings } from 'client/typings'

export interface SettingsInitialState {
  error: null | Error
  isSaved: boolean
  isSaving: boolean 
  loading: boolean
  settings: Settings
}

export const initialState: SettingsInitialState = {
  error: null,
  settings: {} as Settings,
  loading: false,
  isSaved: true,
  isSaving: false
}

export const settingsReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_SETTINGS_REQUESTED:
      return Object.assign({}, state, {
        loading: true
      })

    case FETCH_SETTINGS_SUCCESS:
      return Object.assign({}, state, {
        error: null,
        loading: false,
        settings: action.payload.settings
      })

    case FETCH_SETTINGS_ERROR:
      return Object.assign({}, state, {
        loading: false,
        error: action.payload
      })

    case UPDATE_SETTINGS.PENDING:
      return Object.assign({}, state, {
        isSaving: true,
        isSaved: false,
        settings: state.settings
      })

    case UPDATE_SETTINGS.SUCCESS:
      return Object.assign({}, state, {
        isSaving: false,
        isSaved: true,
        settings: action.payload.settings,
        error: null
      })

    case UPDATE_SETTINGS.ERROR:
      return Object.assign({}, state, {
        isSaving: false,
        error: action.payload.data,
        settings: state.settings
      })

    case RESET_SETTINGS:
      return Object.assign({}, state, {
        error: null,
        isSaving: false,
        isSaved: true,
        loading: false,
        settings: {}
      })

    default:
      return state
  }
}
