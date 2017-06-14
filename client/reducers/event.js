import { FETCH_EVENT, UPDATE_EVENT, CREATE_EVENT, DELETE_EVENT } from '../actions';

const initialState = {
  loading: false,
  event: {},
  error: null,
  saving: null
};

const eventReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_EVENT.PENDING:
      return Object.assign({}, state, {
        loading: true
      });

    case FETCH_EVENT.SUCCESS:
      return Object.assign({}, state, {
        loading: false,
        event: action.payload
      });

    case FETCH_EVENT.ERROR:
      return Object.assign({}, state, {
        loading: false
      });

    case UPDATE_EVENT.PENDING:
      return Object.assign({}, state, {
        saving: true
      });

    case UPDATE_EVENT.SUCCESS:
      return Object.assign({}, state, {
        saving: false,
        event: action.payload.data
      });

    case UPDATE_EVENT.ERROR:
      return Object.assign({}, state, {
        saving: false
      });

    case CREATE_EVENT.PENDING:
      return Object.assign({}, state, {
        saving: true
      });

    case CREATE_EVENT.SUCCESS:
      return Object.assign({}, state, {
        saving: false,
        event: action.payload.data
      });

    case CREATE_EVENT.ERROR:
      return Object.assign({}, state, {
        saving: false
      });

    case DELETE_EVENT.PENDING:
      return Object.assign({}, state, {
        loading: true,
        event: state.event
      });

    case DELETE_EVENT.SUCCESS:
      return Object.assign({}, state, {
        loading: false,
        event: state.event
      });

    case DELETE_EVENT.ERROR:
      return Object.assign({}, state, {
        loading: false
      });

    default:
      return state;
  }
}

export default eventReducer;