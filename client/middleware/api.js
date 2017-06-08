import axios from 'axios';

const BASE_URL = location.href.indexOf('localhost') > 0 ? 'http://localhost:3000/api' : '/api';

const apiMiddleware = ({ dispatch }) => next => action => {

  if (action.type !== 'API') {
    return next(action);
  }

  const handleResponse = (res) => {
    console.log(res)
    dispatch({ type: action.payload.next.SUCCESS, payload: res.data })
  };

  if (action.payload.method == 'get') {
    axios.get(BASE_URL + action.payload.url)
      .then(handleResponse)
      .catch(error =>
        dispatch({ type: action.payload.next.ERROR, payload: error })
      );
  }

  if (action.payload.method == 'put') {
    axios.put(BASE_URL + action.payload.url, action.payload.data)
      .then(handleResponse)
      .catch(error =>
        dispatch({ type: action.payload.next.ERROR, payload: error })
      );
  }

  dispatch({ type: action.payload.next.PENDING });

};

export default apiMiddleware;