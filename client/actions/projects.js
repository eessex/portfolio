import { API, FETCH_PROJECTS } from '../actions';

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

