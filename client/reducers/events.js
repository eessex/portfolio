import { FETCH_EVENTS } from '../actions';

const initialState = {
  loading: false,
  list: []
};

const eventsReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_EVENTS.PENDING:
      return Object.assign({}, state, {
        loading: true
      });

    case FETCH_EVENTS.SUCCESS:
      return Object.assign({}, state, {
        loading: false,
        list: action.payload
      });

    case FETCH_EVENTS.ERROR:
      return Object.assign({}, state, {
        loading: false
      });

    default:
      return state;
  }
}

export default eventsReducer;