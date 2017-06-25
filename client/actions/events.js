import { API, FETCH_EVENTS } from '../actions';

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
