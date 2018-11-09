import { cloneDeep } from 'lodash'
import { initialState, userReducer } from '../user'

describe('userReducer', () => {
  let state
  let action

  beforeEach(() => {
    state = cloneDeep(initialState)
    action = {
      type: '',
      payload: {},
      error: null
    }
  })

  const userPayload = {
    currentUser: {
      email: 'email@email.com',
      _id: '1234'
    },
    session: 'asdfadfasdfasdfadsf'
  }

  const userError = { message: 'User already exists' }

  describe('CREATE_USER', () => {
    it('CREATE_USER_PENDING', () => {
      action.type = 'CREATE_USER_PENDING'
      const newState = userReducer(state, action)

      expect(newState.loading).toBeTruthy()
    })

    it('CREATE_USER.SUCCESS', () => {
      action.type = 'CREATE_USER_SUCCESS'
      action.payload = userPayload
      state.loading = true
      state.error = userError
      const newState = userReducer(state, action)

      expect(newState.loading).toBe(false)
      expect(newState.error).toBe(null)
      expect(newState.isAuthenticated).toBeTruthy()
      expect(newState.currentUser).toEqual({
        email: 'email@email.com',
        _id: '1234'
      })
      expect(newState.session).toBe('asdfadfasdfasdfadsf')
    })

    it('CREATE_USER.ERROR', () => {
      action.type = 'CREATE_USER_ERROR'
      action.payload = { error: userError }
      const newState = userReducer(state, action)

      expect(newState.error).toBe(userError)
      expect(newState.loading).toBe(false)
      expect(newState.isAuthenticated).toBe(false)
      expect(newState.currentUser).toBe(null)
      expect(newState.session).toBe(null)
    })
  })

  describe('LOGIN_USER', () => {
    it('LOGIN_USER.PENDING', () => {
      action.type = 'LOGIN_USER_PENDING'
      const newState = userReducer(state, action)

      expect(newState.loading).toBeTruthy()
    })

    it('LOGIN_USER.SUCCESS', () => {
      action.type = 'LOGIN_USER_SUCCESS'
      action.payload = userPayload
      state.loading = true
      state.error = userError
      const newState = userReducer(state, action)

      expect(newState.loading).toBe(false)
      expect(newState.error).toBe(null)
      expect(newState.isAuthenticated).toBeTruthy()
      expect(newState.currentUser).toEqual({
        email: 'email@email.com',
        _id: '1234'
      })
      expect(newState.session).toBe('asdfadfasdfasdfadsf')
    })

    it('LOGIN_USER.ERROR', () => {
      action.type = 'LOGIN_USER_ERROR'
      action.payload = { error: userError }
      const newState = userReducer(state, action)

      expect(newState.error).toBe(userError)
      expect(newState.loading).toBe(false)
      expect(newState.isAuthenticated).toBe(false)
      expect(newState.currentUser).toBe(null)
      expect(newState.session).toBe(null)
    })
  })

  it('LOGOUT_USER', () => {
    action.type = 'LOGOUT_USER'
    const stateWithUser = Object.assign({}, state, userPayload)
    const newState = userReducer(stateWithUser, action)

    expect(newState).toEqual(initialState)
  })
})
