import {
  API,
  CREATE_EVENT,
  FETCH_EVENTS
} from '../actions'

export const createEvent = () => {
  return {
    type: API,
    payload: {
      method: 'post',
      data: {},
      url: '/events',
      next: CREATE_EVENT
    }
  }
}

export const fetchEvents = (query) => {
  return {
    type: API,
    payload: {
      method: 'get',
      url: '/events',
      query: query,
      next: FETCH_EVENTS
    }
  }
}
