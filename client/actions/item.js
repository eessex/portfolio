import {
  API,
  CHANGE_ITEM,
  DELETE_ITEM,
  FETCH_ITEM,
  FETCH_UPLOAD,  
  RESET_ITEM,
  UPDATE_ITEM  
} from '../actions'
import { getUploadSignature } from './upload.js'

export const changeItem = (key, value) => {
  return {
    type: CHANGE_ITEM,
    payload: {
      key,
      value
    }
  }
}

export const fetchItem = (model, id) => {
  return {
    type: API,
    payload: {
      id,
      method: 'get',
      model,
      next: FETCH_ITEM,
      url: `/${model}/${id}`
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

export const updateItem = (model, item) => {
  return {
    type: API,
    payload: {
      method: 'put',
      item,
      url: `/${model}/${item._id}`,
      next: UPDATE_ITEM
    }
  }
}

export const deleteItem = (model, item) => {
  return {
    type: API,
    payload: {
      method: 'delete',
      item,
      url: `/${model}/${item._id}`,
      next: DELETE_ITEM
    }
  }
}

export const resetItem = () => {
  return {
    type: RESET_ITEM
  }
}
