import {
  API,
  // FETCH_SETTINGS,
  CREATE_SETTINGS,
  UPDATE_SETTINGS,
  RESET_SETTINGS
} from '../actions'
import { getUploadSignature } from './upload.js'

import fetch from 'isomorphic-fetch'
const { API_URL } = process.env

export const FETCH_SETTINGS_SUCCESS = 'FETCH_SETTINGS_SUCCESS'
export const FETCH_SETTINGS_ERROR = 'FETCH_SETTINGS_ERROR'
export const FETCH_SETTINGS_REQUESTED = 'FETCH_SETTINGS_REQUESTED'

export const fetchSettings = () => dispatch => {
  const encodedURI = encodeURI(`${API_URL}/settings`)

  dispatch({
    type: FETCH_SETTINGS_REQUESTED
  })

  return fetch(encodedURI)
    .then(res => {
      if (res) {
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
      console.error(error)
      dispatch({
        type: FETCH_SETTINGS_ERROR,
        payload: {
          error
        }
      })
      return null
    })
}

// export const fetchSettings = () => {
//   return {
//     type: API,
//     payload: {
//       method: 'get',
//       url: '/settings',
//       next: FETCH_SETTINGS
//     }
//   }
// }

export const fetchUpload = (file, data, cb) => {
  return getUploadSignature(file, data, cb)
}

export const createSettings = settings => {
  return {
    type: API,
    payload: {
      method: 'post',
      data: settings,
      url: '/settings',
      next: CREATE_SETTINGS
    }
  }
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