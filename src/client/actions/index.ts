const asyncActionType = (type) => ({
  PENDING: `${type}_PENDING`,
  SUCCESS: `${type}_SUCCESS`,
  ERROR: `${type}_ERROR`
})

export const API = 'API'

// item
export const FETCH_ITEM = asyncActionType('FETCH_ITEM')
export const MAYBE_SAVE_ITEM = 'MAYBE_SAVE_ITEM'
export const UPDATE_ITEM = asyncActionType('UPDATE_ITEM')
export const DELETE_ITEM = asyncActionType('DELETE_ITEM')

// items
export const CREATE_ITEM = asyncActionType('CREATE_ITEM')

// settings
export const FETCH_SETTINGS = asyncActionType('FETCH_SETTINGS')
export const CREATE_SETTINGS = asyncActionType('CREATE_SETTINGS')
export const UPDATE_SETTINGS = asyncActionType('UPDATE_SETTINGS')

// upload
export const FETCH_UPLOAD = asyncActionType('FETCH_UPLOAD')
export const RESET_UPLOAD = 'RESET_UPLOAD'

// user
export const CREATE_USER = asyncActionType('CREATE_USER')
export const LOGIN_USER = asyncActionType('LOGIN_USER')
export const LOGOUT_USER = 'LOGOUT_USER'
