import { API, FETCH_EVENTS } from '../actions';

export const fetchEvents = () => {
  return {
    type: API,
    payload: {
      url: '/events',
      next: FETCH_EVENTS
    }
  }
}
