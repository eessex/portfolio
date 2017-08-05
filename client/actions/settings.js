import { API, FETCH_SETTINGS, UPDATE_SETTINGS, RESET_SETTINGS } from '../actions';

export const fetchSettings = () => {
  return {
    type: API,
    payload: {
      method: 'get',
      url: '/settings',
      next: FETCH_SETTINGS
    }
  }
}

export const updateSettings = (settings) => {
  return {
    type: API,
    payload: {
      method: 'put',
      data: settings,
      url: '/settings',
      next: UPDATE_SETTINGS
    }
  }
}

export const resetSettings = () => {
  return {
    type: RESET_SETTINGS
  }
}