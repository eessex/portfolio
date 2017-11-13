import {
  API,
  DELETE_PROJECT,
  FETCH_PROJECT,
  FETCH_UPLOAD,  
  RESET_PROJECT,
  UPDATE_PROJECT
} from '../actions'

export const deleteProject = (project) => {
  return {
    type: API,
    payload: {
      method: 'delete',
      data: project,
      url: '/projects/' + project._id,
      next: DELETE_PROJECT
    }
  }
}

export const fetchProject = (id) => {
  return {
    type: API,
    payload: {
      method: 'get',
      id: id,
      url: '/projects/' + id,
      next: FETCH_PROJECT
    }
  }
}

export const fetchUpload = (file, data, cb, onSuccess) => {
  return {
    type: API,
    payload: {
      method: 'post',
      url: '/upload',
      data: {fileName: file.name, fileType: file.type},
      next: FETCH_UPLOAD,
      cb: cb,
      onSuccess: onSuccess,
      file: file
    }
  }
}

export const resetProject = () => {
  return {
    type: RESET_PROJECT
  }
}

export const updateProject = (project) => {
  return {
    type: API,
    payload: {
      method: 'put',
      data: project,
      url: '/projects/' + project._id,
      next: UPDATE_PROJECT
    }
  }
}

