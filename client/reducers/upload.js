import { FETCH_SIGNATURE } from '../actions';

const initialState = {
  upload: {},
  loading: false,
  saving: false
};

const uploadReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_SIGNATURE.PENDING:
      debugger
      return Object.assign({}, state, {
        loading: true
      });

    case FETCH_SIGNATURE.SUCCESS:
      debugger
      return Object.assign({}, state, {
        loading: false,
        upload: action.payload
      });

    case FETCH_SIGNATURE.ERROR:
      debugger
      return Object.assign({}, state, {
        loading: false
      });
  }
}