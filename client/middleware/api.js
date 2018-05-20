import axios from 'axios'
const BASE_URL = location.href.indexOf('localhost') > 0 ? 'http://localhost:3000/api' : '/api'

const handleResponse = (res, payload) => {
  const {
    next: { SUCCESS },
    model,
    url
  } = payload

  dispatch({
    type: SUCCESS,
    payload: res.data,
    model
  })

  if (SUCCESS === 'CREATE_ITEM_SUCCESS') {
    const { _id } = res.data.data
    // redirect to new item
    window.location.pathname = `${url}/${_id}`
  }

  if (SUCCESS === 'DELETE_ITEM_SUCCESS') {
    let redirect = url.split('/')[1]
    // redirect to items list
    window.location.pathname = `/${redirect}`
  }

  if (SUCCESS === 'LOGIN_USER_SUCCESS') {
    window.location.pathname = ''
  }
  if (SUCCESS === 'FETCH_UPLOAD_SUCCESS') {
    payload.cb(payload.file, res.data)
  }
}

const handleError = (error, payload) => {
  dispatch({
    type: payload.next.ERROR,
    payload: error.response
  })
}

const apiMiddleware = ({ dispatch }) => next => action => {
  const { payload, type } = action
  const { data, method, query, url } = payload

  if (type !== 'API') {
    return next(action)
  }

  switch(method) {
    case 'get': {
      axios.get(BASE_URL + url, {params: query})
        .then(res =>
          handleResponse(res, payload)
        )
        .catch(error =>
          handleError(error, payload)
        )
    }
    case 'post': {
      axios.post(BASE_URL + url, data)
        .then(res =>
          handleResponse(res, payload)
        )
        .catch(error =>
          handleError(error, payload)
        )
    }
    case 'put': {
      axios.put(BASE_URL + url, data)
        .then(res =>
          handleResponse(res, payload)
        )
        .catch(error =>
          handleError(error, payload)
        )
    }
    case 'get': {
      if (method == ('delete')) {
        axios.delete(BASE_URL + url, data)
          .then(res =>
            handleResponse(res, payload)
          )
          .catch(error =>
            handleError(error, payload)
          )
      }
    }
    default: {
      return null
    }
  }
  dispatch({ type: action.payload.next.PENDING })
}

export default apiMiddleware
