import axios from 'axios'
const BASE_URL = location.href.indexOf('localhost') > 0 ? 'http://localhost:3000/api' : '/api'

const apiMiddleware = ({ dispatch }) => next => action => {
  if (action.type !== 'API') {
    return next(action);
  }

  const handleResponse = (res) => {
    dispatch({ type: action.payload.next.SUCCESS, payload: res.data })
    if (action.payload.next.SUCCESS === 'CREATE_EVENT_SUCCESS') {
      window.location.pathname = '/events/' + res.data.event._id
    }
    if (action.payload.next.SUCCESS === 'LOGIN_USER_SUCCESS') {
      window.location.pathname = ''
    }
  }

  const handleError = (error) => {
    dispatch({ type: action.payload.next.ERROR, payload: error.response })
  }

  if (action.payload.method == 'get') {
    axios.get(BASE_URL + action.payload.url, {params: action.payload.query})
      .then(handleResponse)
      .catch(error =>
        handleError(error)
      )
  }
  if (action.payload.method == ('post')) {
    axios.post(BASE_URL + action.payload.url, action.payload.data)
      .then(handleResponse)
      .catch(error =>
        handleError(error)
      )
  }

  if (action.payload.method == ('put')) {
    axios.put(BASE_URL + action.payload.url, action.payload.data)
      .then(handleResponse)
      .catch(error =>
        handleError(error)
      )
  }

  if (action.payload.method == ('delete')) {
    axios.delete(BASE_URL + action.payload.url, action.payload.data)
      .then(handleResponse)
      .catch(error =>
        handleError(error)
      )
  }

  dispatch({ type: action.payload.next.PENDING });

};

export default apiMiddleware;