import { FETCH_UPLOAD, RESET_UPLOAD } from '../actions';

const initialState = {
  upload: {},
  loading: false,
  saving: false
};

const uploadReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_UPLOAD.PENDING:
      debugger
      return Object.assign({}, state, {
        loading: true
      });

    case FETCH_UPLOAD.SUCCESS:
      debugger
      return Object.assign({}, state, {
        loading: false,
        upload: action.payload
      });

    case FETCH_UPLOAD.ERROR:
      debugger
      return Object.assign({}, state, {
        loading: false
      });
    case RESET_UPLOAD:
      debugger
      return initialState
  }
}