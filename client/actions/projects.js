import {
  API,
  CREATE_PROJECT,
  FETCH_PROJECTS
} from '../actions'

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

export const fetchProjects = (query) => {
  return {
    type: API,
    payload: {
      method: 'get',
      url: '/projects',
      query: query,
      next: FETCH_PROJECTS
    }
  }
}
