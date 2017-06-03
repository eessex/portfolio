const BASE_URL = location.href.indexOf('localhost') > 0 ? 'http://localhost:3000/api' : '/api';

const apiMiddleware = ({ dispatch }) => next => action => {

  if (action.type !== 'API') {
    return next(action);
  }

  const handleResponse = (data) => {
    dispatch({ type: action.payload.next.SUCCESS, payload: data })
  };

  fetch(BASE_URL + action.payload.url)
    .then(response => response.json())
    .then(handleResponse)

  dispatch({ type: action.payload.next.PENDING });

};

export default apiMiddleware;