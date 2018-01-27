import axios from 'axios'
const BASE_URL = location.href.indexOf('localhost') > 0 ? 'http://localhost:3000/api' : '/api'

const apiMiddleware = ({ dispatch }) => next => action => {
  if (action.type !== 'API') {
    return next(action)
  }

  const handleResponse = (res) => {
    const item = res.data
    const { model, next } = action.payload

    if (next.SUCCESS === 'FETCH_ITEM_SUCCESS' || next.SUCCESS === 'UPDATE_ITEM_SUCCESS') {
      dispatch({
        type: action.payload.next.SUCCESS,
        payload: {
          item,
          model
        }
      })
    } else {
      dispatch({ type: action.payload.next.SUCCESS, payload: res.data })
    }

    if (next.SUCCESS === 'CREATE_EVENT_SUCCESS') {
      window.location.pathname = '/events/' + res.data.event._id
    }
    if (SUCCESS === 'CREATE_PROJECT_SUCCESS') {
      window.location.pathname = '/projects/' + res.data.project._id
    }
    if (action.payload.next.SUCCESS === 'CREATE_PUBLICATION_SUCCESS') {
      window.location.pathname = '/publications/' + res.data.publication._id
    }
    if (action.payload.next.SUCCESS === 'LOGIN_USER_SUCCESS') {
      window.location.pathname = ''
    }
    if (action.payload.next.SUCCESS === 'FETCH_UPLOAD_SUCCESS') {
      action.payload.cb(action.payload.file, res.data)
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
    axios.post(BASE_URL + action.payload.url, action.payload.item)
      .then(handleResponse)
      .catch(error =>
        handleError(error)
      )
  }
  if (action.payload.method == ('put')) {
    axios.put(BASE_URL + action.payload.url, action.payload.item)
      .then(handleResponse)
      .catch(error =>
        handleError(error)
      )
  }
  if (action.payload.method == ('delete')) {
    axios.delete(BASE_URL + action.payload.url, action.payload.item)
      .then(handleResponse)
      .catch(error =>
        handleError(error)
      )
  }
  dispatch({ type: action.payload.next.PENDING })
}

export default apiMiddleware
