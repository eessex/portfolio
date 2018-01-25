const asyncActionType = (type) => ({
  PENDING: `${type}_PENDING`,
  SUCCESS: `${type}_SUCCESS`,
  ERROR: `${type}_ERROR`,
})
export const API = 'API'

// event
export const FETCH_EVENT = asyncActionType('FETCH_EVENT')
export const UPDATE_EVENT = asyncActionType('UPDATE_EVENT')
export const DELETE_EVENT = asyncActionType('DELETE_EVENT')
export const RESET_EVENT = 'RESET_EVENT'

// events
export const FETCH_EVENTS = asyncActionType('FETCH_EVENTS')
export const CREATE_EVENT = asyncActionType('CREATE_EVENT')

// item
export const FETCH_ITEM = asyncActionType('FETCH_ITEM')
export const UPDATE_ITEM = asyncActionType('UPDATE_ITEM')
export const DELETE_ITEM = asyncActionType('DELETE_ITEM')
export const RESET_ITEM = 'RESET_ITEM'

// items
export const FETCH_ITEMS = asyncActionType('FETCH_ITEMS')
export const CREATE_ITEMS = asyncActionType('CREATE_ITEMS')

// project
export const FETCH_PROJECT = asyncActionType('FETCH_PROJECT')
export const UPDATE_PROJECT = asyncActionType('UPDATE_PROJECT')
export const DELETE_PROJECT = asyncActionType('DELETE_PROJECT')
export const RESET_PROJECT = 'RESET_PROJECT'

// projects
export const FETCH_PROJECTS = asyncActionType('FETCH_PROJECTS')
export const CREATE_PROJECT = asyncActionType('CREATE_PROJECT')

// publication
export const FETCH_PUBLICATION = asyncActionType('FETCH_PUBLICATION')
export const UPDATE_PUBLICATION = asyncActionType('UPDATE_PUBLICATION')
export const DELETE_PUBLICATION = asyncActionType('DELETE_PUBLICATION')
export const RESET_PUBLICATION = 'RESET_PUBLICATION'

// publications
export const FETCH_PUBLICATIONS = asyncActionType('FETCH_PUBLICATIONS')
export const CREATE_PUBLICATION = asyncActionType('CREATE_PUBLICATION')

// settings
export const FETCH_SETTINGS = asyncActionType('FETCH_SETTINGS')
export const CREATE_SETTINGS = asyncActionType('CREATE_SETTINGS')
export const UPDATE_SETTINGS = asyncActionType('UPDATE_SETTINGS')
export const RESET_SETTINGS = 'RESET_SETTINGS'

// upload
export const FETCH_UPLOAD = asyncActionType('FETCH_UPLOAD')
export const RESET_UPLOAD = 'RESET_UPLOAD'

// user
export const CREATE_USER = asyncActionType('CREATE_USER')
export const LOGIN_USER = asyncActionType('LOGIN_USER')
export const LOGOUT_USER = 'LOGOUT_USER'
