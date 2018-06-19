import {
  API,
  CHANGE_ITEM,
  DELETE_ITEM,
  FETCH_ITEM,
  FETCH_UPLOAD,
  MAYBE_SAVE_ITEM,
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

export const maybeSaveItem = (model, forceSave) => {
  return (dispatch, getState) => {
    const { item } = getState().item

    if (!item.published || forceSave) {
      dispatch(updateItem(model, item))
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
      data: item,
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
      data: item,
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
