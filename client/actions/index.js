const asyncActionType = (type) => ({
  PENDING: `${type}_PENDING`,
  SUCCESS: `${type}_SUCCESS`,
  ERROR: `${type}_ERROR`,
});
export const API = 'API';

// events
export const FETCH_EVENTS = asyncActionType('FETCH_EVENTS');

// event
export const FETCH_EVENT = asyncActionType('FETCH_EVENT');
export const CREATE_EVENT = asyncActionType('CREATE_EVENT');
export const UPDATE_EVENT = asyncActionType('UPDATE_EVENT');
export const DELETE_EVENT = asyncActionType('DELETE_EVENT');
export const RESET_EVENT = 'RESET_EVENT';

// settings
export const FETCH_SETTINGS = asyncActionType('FETCH_SETTINGS');
export const CREATE_SETTINGS = asyncActionType('CREATE_SETTINGS');
export const UPDATE_SETTINGS = asyncActionType('UPDATE_SETTINGS');
export const RESET_SETTINGS = 'RESET_SETTINGS';

// upload
export const FETCH_UPLOAD = asyncActionType('FETCH_UPLOAD');
export const RESET_UPLOAD = 'RESET_UPLOAD';

// user
export const CREATE_USER = asyncActionType('CREATE_USER');
export const LOGIN_USER = asyncActionType('LOGIN_USER');
export const LOGOUT_USER = 'LOGOUT_USER';
