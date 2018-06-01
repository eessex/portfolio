import {
  API,
  FETCH_SETTINGS,
  CREATE_SETTINGS,
  UPDATE_SETTINGS,
  RESET_SETTINGS
} from '../actions'
import { getUploadSignature } from './upload.js'

export const fetchSettings = () => {
  return {
    type: API,
    payload: {
      method: 'get',
      url: '/settings',
      next: FETCH_SETTINGS
    }
  }
}

export const fetchUpload = (file, data, cb) => {
  return getUploadSignature(file, data, cb)
}

export const createSettings = (settings) => {
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

export const updateSettings = (settings) => {
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