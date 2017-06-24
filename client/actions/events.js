import { API, FETCH_EVENTS } from '../actions';

export const fetchEvents = (query={}) => {
  return {
    type: API,
    payload: {
      method: 'get',
      url: '/events',
      params: query,
      next: FETCH_EVENTS
    }
  }
}
