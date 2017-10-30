import {
  API,
  FETCH_PROJECT,
  UPDATE_PROJECT,
  CREATE_PROJECT,
  DELETE_PROJECT,
  RESET_PROJECT,
  FETCH_UPLOAD
} from '../actions'

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

export const createProject = () => {
  return {
    type: API,
    payload: {
      method: 'post',
      data: {},
      url: '/projects',
      next: CREATE_PROJECT
    }
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

export const resetProject = () => {
  return {
    type: RESET_PROJECT
  }
}
