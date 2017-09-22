import { FETCH_EVENT, UPDATE_EVENT, CREATE_EVENT, DELETE_EVENT, RESET_EVENT, FETCH_UPLOAD, RESET_UPLOAD } from '../actions';

const initialState = {
  event: {},
  loading: false,
  uploading: false,
  saving: false,
  upload: {}
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
        saving: true,
        event: state.event
      });

    case UPDATE_EVENT.SUCCESS:
      return Object.assign({}, state, {
        saving: false,
        event: action.payload.event,
        error: null
      });

    case UPDATE_EVENT.ERROR:
      return Object.assign({}, state, {
        saving: false,
        error: action.payload.data,
        event: state.event
      });

    case CREATE_EVENT.PENDING:
      return Object.assign({}, state, {
        saving: true,
        event: state.event
      });

    case CREATE_EVENT.SUCCESS:
      return Object.assign({}, state, {
        saving: false,
        event: action.payload.event,
        error: null
      });

    case CREATE_EVENT.ERROR:
      return Object.assign({}, state, {
        saving: false,
        error: action.payload.data,
        event: state.event
      });

    case DELETE_EVENT.PENDING:
      return Object.assign({}, state, {
        loading: true,
        event: state.event
      });

    case DELETE_EVENT.SUCCESS:
      return Object.assign({}, state, {
        loading: true
      });

    case DELETE_EVENT.ERROR:
      return Object.assign({}, state, {
        loading: false,
        event: state.event
      });

    case RESET_EVENT:
      return Object.assign({}, state, {
        loading: false,
        uploading: false,
        event: state.event
      });

    case FETCH_UPLOAD.PENDING:
      return Object.assign({}, state, {
        uploading: true
      });

    case FETCH_UPLOAD.SUCCESS:
      return Object.assign({}, state, {
        uploading: false,
        upload: action.payload
      });

    case FETCH_UPLOAD.ERROR:
      return Object.assign({}, state, {
        uploading: false
      });
    case RESET_UPLOAD:
      return initialState

    default:
      return state;
  }
}

export default eventReducer;