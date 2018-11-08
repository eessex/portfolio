import {
  CREATE_USER,
  LOGIN_USER,
  LOGOUT_USER
} from '../actions'

const initialState = {
  loading: false,
  isAuthenticated: false,
  currentUser: null,
  session: null,
  error: null
}

const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case CREATE_USER.PENDING:
      return Object.assign({}, state, {
        loading: false
      })

    case CREATE_USER.SUCCESS:
      return Object.assign({}, state, {
        loading: false,
        isAuthenticated: true,
        error: null
      })

    case CREATE_USER.ERROR:
      return Object.assign({}, state, {
        loading: false,
        isAuthenticated: false,
        error: action.payload.data.error
      })

    case LOGIN_USER.PENDING:
      return Object.assign({}, state, {
        loading: true,
        error: null
      })

    case LOGIN_USER.SUCCESS:
      const { currentUser, session } = action.payload

      return Object.assign({}, state, {
        loading: false,
        isAuthenticated: true,
        error: null,
        currentUser,
        session
      })

    case LOGIN_USER.ERROR:
      return Object.assign({}, state, {
        loading: false,
        isAuthenticated: false,
        error: action.payload.data.error,
        currentUser: null,
        session: null
      })

    case LOGOUT_USER:
      return Object.assign({}, state, {
        loading: false,
        isAuthenticated: false,
        error: null,
        currentUser: undefined
      })

    default:
      return state
  }
}

export default userReducer
