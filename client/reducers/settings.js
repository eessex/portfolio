import { FETCH_SETTINGS, CREATE_SETTINGS, UPDATE_SETTINGS, RESET_SETTINGS } from '../actions';

const initialState = {
  settings: {},
  loading: false,
  saving: false
};

const settingsReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_SETTINGS.PENDING:
      return Object.assign({}, state, {
        loading: true
      });

    case FETCH_SETTINGS.SUCCESS:
      return Object.assign({}, state, {
        loading: false,
        settings: action.payload[0]
      });

    case FETCH_SETTINGS.ERROR:
      return Object.assign({}, state, {
        loading: false
      });

    case CREATE_SETTINGS.PENDING:
      return Object.assign({}, state, {
        saving: true,
        settings: state.settings[0]
      });

    case CREATE_SETTINGS.SUCCESS:
      return Object.assign({}, state, {
        saving: false,
        settings: action.payload.settings[0],
        error: null
      });

    case CREATE_SETTINGS.ERROR:
      return Object.assign({}, state, {
        saving: false,
        error: action.payload.data,
        settings: state.settings
      });

    case UPDATE_SETTINGS.PENDING:
      return Object.assign({}, state, {
        saving: true,
        settings: state.settings
      });

    case UPDATE_SETTINGS.SUCCESS:
      return Object.assign({}, state, {
        saving: false,
        settings: action.payload.settings,
        error: null
      });

    case UPDATE_SETTINGS.ERROR:
      return Object.assign({}, state, {
        saving: false,
        error: action.payload.data,
        settings: state.settings
      });

    case RESET_SETTINGS:
      return Object.assign({}, state, {
        loading: false,
        settings: state.settings
      });

    default:
      return state;
  }
}

export default settingsReducer;