import { API, FETCH_EVENT } from '../actions';

export const fetchEvent = (id) => {
  return {
    type: API,
    payload: {
    	id: id,
      url: '/events/' + id,
      next: FETCH_EVENT
    }
  }
}
