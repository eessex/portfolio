import {
  API,
  CREATE_ITEM,
  FETCH_ITEMS
} from '../actions'

export const createItem = (model) => {
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

export const fetchItems = (model, query) => {
  return {
    type: API,
    payload: {
      method: 'get',
      url: `/${model}`,
      query: query,
      next: FETCH_ITEMS
    }
  }
}
