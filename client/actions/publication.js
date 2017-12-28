import {
  API,
  DELETE_PUBLICATION,
  FETCH_PUBLICATION,
  FETCH_UPLOAD,  
  RESET_PUBLICATION,
  UPDATE_PUBLICATION
} from '../actions'
import { getUploadSignature } from './upload.js'

export const deletePublication = (data) => {
  return {
    type: API,
    payload: {
      method: 'delete',
      data,
      url: '/publications/' + data._id,
      next: DELETE_PUBLICATION
    }
  }
}

export const fetchPublication = (id) => {
  return {
    type: API,
    payload: {
      method: 'get',
      id,
      url: '/publications/' + id,
      next: FETCH_PUBLICATION
    }
  }
}

export const fetchUpload = (file, data, cb) => {
  return getUploadSignature(file, data, cb)
}

export const resetPublication = () => {
  return {
    type: RESET_PUBLICATION
  }
}

export const updatePublication = (data) => {
  return {
    type: API,
    payload: {
      method: 'put',
      data,
      url: '/publications/' + data._id,
      next: UPDATE_PUBLICATION
    }
  }
}

