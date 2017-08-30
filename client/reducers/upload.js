import { FETCH_UPLOAD, RESET_UPLOAD } from '../actions';

const initialState = {
  upload: {},
  loading: false,
  saving: false
};

const uploadReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_UPLOAD.PENDING:
      return Object.assign({}, state, {
        loading: true
      });

    case FETCH_UPLOAD.SUCCESS:
      return Object.assign({}, state, {
        loading: false,
        upload: action.payload
      });

    case FETCH_UPLOAD.ERROR:
      return Object.assign({}, state, {
        loading: false
      });
    case RESET_UPLOAD:
      return initialState
  }
}