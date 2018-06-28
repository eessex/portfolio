import axios from 'axios'
const BASE_URL = location.href.indexOf('localhost') > 0 ? 'http://localhost:3000/api' : '/api'

const apiMiddleware = ({ dispatch }) => next => action => {
  if (action.type !== 'API') {
    return next(action)
  }

  const handleResponse = (res) => {
    const { model, url } = action.payload

    dispatch({
      type: action.payload.next.SUCCESS,
      payload: res.data,
      model
    })

    if (action.payload.next.SUCCESS === 'CREATE_ITEM_SUCCESS') {
      const { _id } = res.data.data
      // redirect to new item
      window.location.pathname = `${url}/${_id}`
    }

    if (action.payload.next.SUCCESS === 'DELETE_ITEM_SUCCESS') {
      let redirect = url.split('/')[1]
      // redirect to items list
      window.location.pathname = `/${redirect}`
    }

    if (action.payload.next.SUCCESS === 'LOGIN_USER_SUCCESS') {
      window.location.pathname = ''
    }
    if (action.payload.next.SUCCESS === 'FETCH_UPLOAD_SUCCESS') {
      action.payload.cb(action.payload.file, res.data)
    }
  }

  const handleError = error => {
    console.log(error)
    dispatch({
      type: action.payload.next.ERROR,
      payload: error.response
    })
  }

  const { data, method, query, url } = action.payload

  if (method === 'get') {
    axios.get(BASE_URL + url, {params: query})
      .then(handleResponse)
      .catch(error =>
        handleError(error)
      )
  }
  if (method === ('post')) {
    axios.post(BASE_URL + url, data)
      .then(handleResponse)
      .catch(error =>
        handleError(error)
      )
  }
  if (method === ('put')) {
    axios.put(BASE_URL + url, data)
      .then(handleResponse)
      .catch(error =>
        handleError(error)
      )
  }
  if (method === ('delete')) {
    axios.delete(BASE_URL + url, data)
      .then(handleResponse)
      .catch(error =>
        handleError(error)
      )
  }
  dispatch({ type: action.payload.next.PENDING })
}

export default apiMiddleware
