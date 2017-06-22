import { LOGIN_USER, LOGOUT_USER } from '../actions';

const initialState = {
  loading: false,
  isAuthenticated: false
};

const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOGIN_USER.PENDING:
      return Object.assign({}, state, {
        loading: true
      });

    case LOGIN_USER.SUCCESS:
      return Object.assign({}, state, {
        loading: false,
        isAuthenticated: true
      });

    case LOGIN_USER.ERROR:
      return Object.assign({}, state, {
        loading: false,
        isAuthenticated: false
      });

    case LOGOUT_USER:
      return Object.assign({}, state, {
        loading: false,
        isAuthenticated: false
      });

    default:
      return state;
  }
}

export default userReducer;