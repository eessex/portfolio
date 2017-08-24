import { FETCH_SIGNATURE } from '../actions';

const initialState = {
  signature: {},
  loading: false,
  saving: false
};

const uploadReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_SIGNATURE.PENDING:
      return Object.assign({}, state, {
        loading: true
      });

    case FETCH_SIGNATURE.SUCCESS:
      return Object.assign({}, state, {
        loading: false,
        signature: action.payload[0]
      });

    case FETCH_SIGNATURE.ERROR:
      return Object.assign({}, state, {
        loading: false
      });
  }
}