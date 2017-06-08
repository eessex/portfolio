const asyncActionType = (type) => ({
  PENDING: `${type}_PENDING`,
  SUCCESS: `${type}_SUCCESS`,
  ERROR: `${type}_ERROR`,
});

export const API = 'API';

export const FETCH_EVENTS = asyncActionType('FETCH_EVENTS');
export const FETCH_EVENT = asyncActionType('FETCH_EVENT');