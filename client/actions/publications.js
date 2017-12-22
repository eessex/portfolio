import {
  API,
  CREATE_PUBLICATION,
  FETCH_PUBLICATIONS
} from '../actions'

export const createPublication = () => {
  return {
    type: API,
    payload: {
      method: 'post',
      data: {},
      url: '/publications',
      next: CREATE_PUBLICATION
    }
  }
}

export const fetchPublications = (query) => {
  return {
    type: API,
    payload: {
      method: 'get',
      url: '/publications',
      query,
      next: FETCH_PUBLICATIONS
    }
  }
}
