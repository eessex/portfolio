import { cloneDeep } from 'lodash'
import { UpcomingEvent, PastEvent } from 'client/tests/fixtures/events'
import { initialState, itemsReducer } from '../items'
import {
  FETCH_ITEMS_ERROR,
  FETCH_ITEMS_REQUESTED,
  FETCH_ITEMS_SUCCESS,
  RESET_ITEMS
} from 'client/actions/items'

describe('itemsReducer', () => {
  let state
  let action

  beforeEach(() => {
    state = cloneDeep(initialState)
    action = {
      type: '',
      payload: {},
      error: null
    }
  })

  const itemsPayload = { items: [UpcomingEvent, PastEvent] }
  const itemsError = { message: 'Error' }

  describe('FETCH_ITEMS', () => {
    it('FETCH_ITEMS_REQUESTED', () => {
      action.type = FETCH_ITEMS_REQUESTED
      const newState = itemsReducer(state, action)

      expect(newState.loading).toBeTruthy()
    })

    it('FETCH_ITEMS_SUCCESS', () => {
      action.type = FETCH_ITEMS_SUCCESS
      action.payload = itemsPayload
      const newState = itemsReducer(state, action)

      expect(newState.loading).toBeFalsy()
      expect(newState.list.length).toBe(2)
      expect(newState.list[1].title).toBe('Eve Essex')
    })

    it('FETCH_ITEMS_ERROR', () => {
      action.type = FETCH_ITEMS_ERROR
      action.payload = itemsError
      const newState = itemsReducer(state, action)

      expect(newState.loading).toBeFalsy()
      expect(newState.error.message).toBe('Error')
    })
  })

  describe('CREATE_ITEM', () => {
    it('CREATE_ITEM.PENDING', () => {
      action.type = 'CREATE_ITEM_PENDING'
      const newState = itemsReducer(state, action)

      expect(newState.loading).toBeTruthy()
    })

    it('CREATE_ITEM.SUCCESS', () => {
      action.type = 'CREATE_ITEM_SUCCESS'
      action.payload.data = { _id: '12345' }
      const newState = itemsReducer(state, action)

      expect(newState.loading).toBeFalsy()
      expect(newState.list.length).toBe(1)
      expect(newState.list[0]._id).toBe('12345')
    })

    it('CREATE_ITEM.ERROR', () => {
      action.type = 'CREATE_ITEM_ERROR'
      action.payload = itemsError
      const newState = itemsReducer(state, action)

      expect(newState.loading).toBeFalsy()
      expect(newState.error.message).toBe('Error')
    })
  })

  it('RESET_ITEMS', () => {
    action.type = RESET_ITEMS
    state.list = itemsPayload
    const newState = itemsReducer(state, action)

    expect(newState.loading).toBeFalsy()
    expect(newState.list).toEqual([])
  })
})
