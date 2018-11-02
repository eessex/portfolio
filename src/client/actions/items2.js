import fetch from 'isomorphic-fetch'
const { API_URL } = process.env

export const FETCH_ITEMS_SUCCESS = 'FETCH_ITEMS_SUCCESS'
export const FETCH_ITEMS_ERROR = 'FETCH_ITEMS_ERROR'
export const FETCH_ITEMS_REQUESTED = 'FETCH_ITEMS_REQUESTED'
export const RESET_ITEMS = 'RESET_ITEMS'

export const fetchItems = (model = '', query = {}) => dispatch => {
  const encodedURI = encodeURI(`${API_URL}${model}`)

  dispatch({
    type: FETCH_ITEMS_REQUESTED
  })

  return fetch(encodedURI, query)
    .then(res => {
      if (res) {
        return res.json()
      }
    })
    .then(items => {
      dispatch({
        type: FETCH_ITEMS_SUCCESS,
        payload: {
          items
        }
      })
      return items
    })
    .catch(error => {
      console.error(error)
      dispatch({
        type: FETCH_ITEMS_ERROR,
        payload: {
          error
        }
      })
      return null
    })
}

export const resetItems = () => {
  return {
    type: RESET_ITEMS
  }
}
