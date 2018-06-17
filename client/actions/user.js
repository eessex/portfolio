import {
  API,
  CREATE_USER,
  LOGIN_USER,
  LOGOUT_USER
} from '../actions'

export const createUser = creds => {
  return {
    type: API,
    payload: {
      method: 'post',
      data: creds,
      url: '/users',
      next: CREATE_USER
    }
  }
}

export const loginUser = creds => {
  return {
    type: API,
    payload: {
      method: 'post',
      data: creds,
      url: '/users/session/create',
      next: LOGIN_USER
    }
  }
}

export const logoutUser = () => {
  return {
    type: LOGOUT_USER
  }
}
