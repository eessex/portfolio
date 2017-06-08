import { API, FETCH_EVENT, UPDATE_EVENT, CREATE_EVENT, DELETE_EVENT, RESET_EVENT } from '../actions';

export const fetchEvent = (id) => {
  return {
    type: API,
    payload: {
      method: 'get',
      id: id,
      url: '/events/' + id,
      next: FETCH_EVENT
    }
  }
}

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

export const updateEvent = (event) => {
  return {
    type: API,
    payload: {
      method: 'put',
      data: event,
      url: '/events/' + event._id,
      next: UPDATE_EVENT
    }
  }
}

export const deleteEvent = (event) => {
  return {
    type: API,
    payload: {
      method: 'delete',
      data: event,
      url: '/events/' + event._id,
      next: DELETE_EVENT
    }
  }
}

export const resetEvent = () => {
  return {
    type: RESET_EVENT
  }
}