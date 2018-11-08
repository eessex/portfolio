import axios from 'axios'
import Cookies from 'universal-cookie'

const { API_URL } = process.env
const cookies = new Cookies()

const apiMiddleware = ({ dispatch }) => next => action => {
  if (action.type !== 'API') {
    return next(action)
  }

  const handleResponse = res => {
    const { model, url } = action.payload

    dispatch({
      type: action.payload.next.SUCCESS,
      payload: res.data,
      model
    })

    if (action.payload.next.SUCCESS === 'CREATE_ITEM_SUCCESS') {
      const { _id } = res.data.data
      // redirect to new item
      const formattedUrl = url === '/publications' ? '/releases' : url
      window.location.pathname = `${formattedUrl}/${_id}`
    }

    if (action.payload.next.SUCCESS === 'DELETE_ITEM_SUCCESS') {
      let redirect = url.split('/')[1]
      const formattedUrl = redirect === 'publications' ? 'releases' : redirect

      // redirect to items list
      window.location.pathname = `/${formattedUrl}`
    }

    if (action.payload.next.SUCCESS === 'LOGIN_USER_SUCCESS') {
      cookies.set('portfolio.session', res.data.session, { maxAge: 2592000 })
      window.location.pathname = ''
    }

    if (action.payload.next.SUCCESS === 'FETCH_UPLOAD_SUCCESS') {
      action.payload.cb(action.payload.file, res)
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
    axios.get(API_URL + url, {params: query})
      .then(handleResponse)
      .catch(error =>
        handleError(error)
      )
  }
  if (method === ('post')) {
    axios.post(API_URL + url, data)
      .then(handleResponse)
      .catch(error =>
        handleError(error)
      )
  }
  if (method === ('put')) {
    axios.put(API_URL + url, data)
      .then(handleResponse)
      .catch(error =>
        handleError(error)
      )
  }
  if (method === ('delete')) {
    axios.delete(API_URL + url, data)
      .then(handleResponse)
      .catch(error =>
        handleError(error)
      )
  }
  dispatch({ type: action.payload.next.PENDING })
}

export default apiMiddleware
