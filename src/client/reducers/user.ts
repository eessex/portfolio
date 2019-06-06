import {
  CREATE_USER,
  LOGIN_USER,
  LOGOUT_USER
} from '../actions'
import { Error } from 'client/typings'

export interface UserInitialState {
  currentUser: null
  error: null | Error
  isAuthenticated: boolean
  loading: boolean
  session: null
}

export const initialState: UserInitialState = {
  currentUser: null,
  error: null,
  isAuthenticated: false,
  loading: false,
  session: null
}

export const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case CREATE_USER.PENDING:
      return Object.assign({}, state, {
        loading: true
      })

    case CREATE_USER.SUCCESS:
      return Object.assign({}, state, {
        loading: false,
        isAuthenticated: true,
        error: null,
        currentUser: action.payload.currentUser,
        session: action.payload.session
      })

    case CREATE_USER.ERROR:
      return Object.assign({}, state, {
        loading: false,
        isAuthenticated: false,
        error: action.payload.error
      })

    case LOGIN_USER.PENDING:
      return Object.assign({}, state, {
        loading: true,
        error: null
      })

    case LOGIN_USER.SUCCESS:
      return Object.assign({}, state, {
        loading: false,
        isAuthenticated: true,
        error: null,
        currentUser: action.payload.currentUser,
        session: action.payload.session
      })

    case LOGIN_USER.ERROR:
      return Object.assign({}, state, {
        loading: false,
        isAuthenticated: false,
        error: action.payload.error,
        currentUser: null,
        session: null
      })

    case LOGOUT_USER:
      return Object.assign({}, state, {
        loading: false,
        isAuthenticated: false,
        error: null,
        currentUser: null,
        session: null
      })

    default:
      return state
  }
}

export default userReducer
