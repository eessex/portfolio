import 'isomorphic-fetch'
import {
  API,
  UPDATE_SETTINGS
} from '.'
const { API_URL } = process.env

export const FETCH_SETTINGS_SUCCESS = 'FETCH_SETTINGS_SUCCESS'
export const FETCH_SETTINGS_ERROR = 'FETCH_SETTINGS_ERROR'
export const FETCH_SETTINGS_REQUESTED = 'FETCH_SETTINGS_REQUESTED'
export const RESET_SETTINGS = 'RESET_SETTINGS'

export const fetchSettings = () => dispatch => {
  const encodedURI = encodeURI(`${API_URL}/settings`)

  dispatch({
    type: FETCH_SETTINGS_REQUESTED
  })

  return fetch(encodedURI)
    .then((res: any) => { // FIXME: add real typing
      if (res) {
        if (!res.ok) {
          throw Error(res.status)
        }
        return res.json()
      }
    })
    .then(settings => {
      dispatch({
        type: FETCH_SETTINGS_SUCCESS,
        payload: {
          settings
        }
      })
      return settings
    })
    .catch(error => {
      dispatch({
        type: FETCH_SETTINGS_ERROR,
        payload: {
          error: { message: error.toString() }
        }
      })
      return null
    })
}

export const updateSettings = settings => {
  return {
    type: API,
    payload: {
      method: 'put',
      data: settings,
      url: '/settings/' + settings._id,
      next: UPDATE_SETTINGS
    }
  }
}

export const resetSettings = () => {
  return {
    type: RESET_SETTINGS
  }
}
