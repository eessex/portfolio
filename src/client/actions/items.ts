import 'isomorphic-fetch'
import * as url from 'url'
import { API, CREATE_ITEM } from 'client/actions'
import { Model } from 'client/typings'
const { API_URL } = process.env

export const FETCH_ITEMS_SUCCESS = 'FETCH_ITEMS_SUCCESS'
export const FETCH_ITEMS_ERROR = 'FETCH_ITEMS_ERROR'
export const FETCH_ITEMS_REQUESTED = 'FETCH_ITEMS_REQUESTED'
export const RESET_ITEMS = 'RESET_ITEMS'

export const createItem = (model: Model) => {
  // TODO: remove api middleware
  return {
    type: API,
    payload: {
      method: 'post',
      data: {},
      url: `/${model}`,
      next: CREATE_ITEM
    }
  }
}

export const fetchItems = (model = '', query = {}) => dispatch => {
  const encodedURI = url.parse(`${API_URL}${model}`)
  // @ts-ignore FIXME: not sure
  encodedURI.query = query
  const formattedURI = url.format(encodedURI)

  dispatch({
    type: FETCH_ITEMS_REQUESTED
  })

  return fetch(formattedURI)
    .then((res: any) => { // FIXME: add real typing
      if (res) {
        if (!res.ok) {
          throw Error(res.status)
        }
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
      dispatch({
        type: FETCH_ITEMS_ERROR,
        payload: {
          error: { message: error.toString() }
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
