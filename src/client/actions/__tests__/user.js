import {
  createUser,
  loginUser,
  logoutUser
} from '../user.js'

const mockRemoveCookie = jest.fn()
jest.mock('universal-cookie', () => () => {
  return {
    remove: (args) => mockRemoveCookie(args)
  }
})

describe('User actions', () => {
  it('#createUser', () => {
    const creds = { email: 'email@email.com', password: 'password' }

    expect(createUser(creds)).toEqual({
      type: 'API',
      payload: {
        method: 'post',
        data: { email: 'email@email.com', password: 'password' },
        url: '/users',
        next: {
          PENDING: 'CREATE_USER_PENDING',
          SUCCESS: 'CREATE_USER_SUCCESS',
          ERROR: 'CREATE_USER_ERROR'
        }
      }
    })
  })

  it('#loginUser', () => {
    const creds = { email: 'email@email.com', password: 'password' }

    expect(loginUser(creds)).toEqual({
      type: 'API',
      payload: {
        method: 'post',
        data: { email: 'email@email.com', password: 'password' },
        url: '/users/session/create',
        next: {
          PENDING: 'LOGIN_USER_PENDING',
          SUCCESS: 'LOGIN_USER_SUCCESS',
          ERROR: 'LOGIN_USER_ERROR'
        }
      }
    })
  })

  it('#logoutUser', () => {
    expect(logoutUser()).toEqual({
      type: 'LOGOUT_USER'
    })
    expect(mockRemoveCookie).toBeCalledWith('portfolio.session')
  })
})
