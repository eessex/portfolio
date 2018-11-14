import 'isomorphic-fetch'
const { API_URL } = process.env

export const FETCH_PAGE_SUCCESS = 'FETCH_PAGE_SUCCESS'
export const FETCH_PAGE_ERROR = 'FETCH_PAGE_ERROR'
export const FETCH_PAGE_REQUESTED = 'FETCH_PAGE_REQUESTED'
export const RESET_PAGE = 'RESET_PAGE'

export const fetchPage = (id, query = {}) => dispatch => {
  const encodedURI = encodeURI(`${API_URL}/pages${id}`)

  dispatch({
    type: FETCH_PAGE_REQUESTED
  })

  return fetch(encodedURI, query)
    .then(res => {
      if (res) {
        return res.json()
      }
    })
    .then(page => {
      dispatch({
        type: FETCH_PAGE_SUCCESS,
        payload: {
          page
        }
      })
      return page
    })
    .catch(error => {
      console.warn(error)
      dispatch({
        type: FETCH_PAGE_ERROR,
        payload: {
          error: { message: error.toString() }
        }
      })
      return null
    })
}

export const resetPage = () => {
  return {
    type: RESET_PAGE
  }
}
