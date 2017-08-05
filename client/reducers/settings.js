import { FETCH_SETTINGS, UPDATE_SETTINGS, RESET_SETTINGS } from '../actions';

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
        setting: action.payload
      });

    case FETCH_SETTINGS.ERROR:
      return Object.assign({}, state, {
        loading: false
      });

    case UPDATE_SETTINGS.PENDING:
      return Object.assign({}, state, {
        saving: true,
        setting: state.setting
      });

    case UPDATE_SETTINGS.SUCCESS:
      return Object.assign({}, state, {
        saving: false,
        setting: action.payload.setting,
        error: null
      });

    case UPDATE_SETTINGS.ERROR:
      return Object.assign({}, state, {
        saving: false,
        error: action.payload.data,
        setting: state.setting
      });

    case RESET_SETTINGS:
      return Object.assign({}, state, {
        loading: false,
        setting: state.setting
      });

    default:
      return state;
  }
}

export default settingsReducer;