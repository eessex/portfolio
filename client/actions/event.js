import {
  API,
  DELETE_EVENT,
  FETCH_EVENT,
  FETCH_UPLOAD,  
  RESET_EVENT,
  UPDATE_EVENT  
} from '../actions'
import { getUploadSignature } from './upload.js'

export const fetchEvent = (id) => {
  return {
    type: API,
    payload: {
      method: 'get',
      id: id,
      url: '/events/' + id,
      next: FETCH_EVENT
    }
  }
}

export const fetchUpload = (file, data, cb) => {
  return getUploadSignature(file, data, cb)
}

export const updateEvent = (event) => {
  return {
    type: API,
    payload: {
      method: 'put',
      data: event,
      url: '/events/' + event._id,
      next: UPDATE_EVENT
    }
  }
}

export const deleteEvent = (event) => {
  return {
    type: API,
    payload: {
      method: 'delete',
      data: event,
      url: '/events/' + event._id,
      next: DELETE_EVENT
    }
  }
}

export const resetEvent = () => {
  return {
    type: RESET_EVENT
  }
}
