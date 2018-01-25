import {
  API,
  DELETE_ITEM,
  FETCH_ITEM,
  FETCH_UPLOAD,  
  RESET_ITEM,
  UPDATE_ITEM  
} from '../actions'
import { getUploadSignature } from './upload.js'

export const fetchItem = (id) => {
  return {
    type: API,
    payload: {
      method: 'get',
      id: id,
      url: '/items/' + id,
      next: FETCH_ITEM
    }
  }
}

export const fetchUpload = (file, data, cb) => {
  const { name, type } = file

  return {
    type: API,
    payload: {
      method: 'post',
      url: '/upload',
      data: {
        fileName: name,
        fileType: type
      },
      next: FETCH_UPLOAD,
      cb: cb,
      file: file
    }
  }
}

export const updateItem = (item) => {
  return {
    type: API,
    payload: {
      method: 'put',
      data: item,
      url: '/items/' + item._id,
      next: UPDATE_ITEM
    }
  }
}

export const deleteItem = (item) => {
  return {
    type: API,
    payload: {
      method: 'delete',
      data: item,
      url: '/items/' + item._id,
      next: DELETE_ITEM
    }
  }
}

export const resetItem = () => {
  return {
    type: RESET_ITEM
  }
}
