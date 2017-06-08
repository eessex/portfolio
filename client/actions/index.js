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
export const UPDATE_EVENT = asyncActionType('UPDATE_EVENT');
