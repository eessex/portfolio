import { FETCH_EVENT } from '../actions';

const initialState = {
  loading: false,
  event: {}
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

    default:
      return state;
  }
}

export default eventReducer;