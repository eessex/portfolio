import { cloneDeep } from 'lodash'
import { UpcomingEvent } from 'client/tests/fixtures/events'
import { itemReducer, initialState } from '../item'

describe('itemReducer', () => {
  let state
  let action

  beforeEach(() => {
    state = cloneDeep(initialState)
    action = {
      type: '',
      payload: {},
      error: null,
      model: 'events' // TODO: Is model used?
    }
  })

  const itemPayload = { item: UpcomingEvent }
  const itemError = { message: 'Start date is required' }

  it('CHANGE_ITEM', () => {
    action.type = 'CHANGE_ITEM'
    action.payload = {
      key: 'title',
      value: 'New Title'
    }
    const newState = itemReducer(state, action)

    expect(newState.item.title).toBe('New Title')
    expect(newState.isSaved).toBeFalsy()
    expect(newState.isSaving).toBeTruthy()
  })

  describe('FETCH_ITEM', () => {
    it('FETCH_ITEM_REQUESTED', () => {
      action.type = 'FETCH_ITEM_REQUESTED'
      const newState = itemReducer(state, action)

      expect(newState.loading).toBeTruthy()
    })

    it('FETCH_ITEM_SUCCESS', () => {
      action.type = 'FETCH_ITEM_SUCCESS'
      action.payload = itemPayload
      state.loading = true
      state.error = itemError
      const newState = itemReducer(state, action)

      expect(newState.loading).toBeFalsy()
      expect(newState.error).toBe(null)
      expect(newState.item).toEqual(UpcomingEvent)
      expect(newState.model).toEqual('events')
    })

    it('FETCH_ITEM_ERROR', () => {
      action.type = 'FETCH_ITEM_ERROR'
      action.payload.error = itemError
      const newState = itemReducer(state, action)

      expect(newState.error).toBe(itemError)
      expect(newState.loading).toBeFalsy()
      expect(newState.item).toEqual({})
    })
  })

  describe('UPDATE_ITEM', () => {
    it('UPDATE_ITEM_PENDING', () => {
      action.type = 'UPDATE_ITEM_PENDING'
      const newState = itemReducer(state, action)

      expect(newState.isSaving).toBeTruthy()
    })

    it('UPDATE_ITEM_SUCCESS', () => {
      action.type = 'UPDATE_ITEM_SUCCESS'
      action.payload = UpcomingEvent
      state.error = itemError
      const newState = itemReducer(state, action)

      expect(newState.error).toBe(null)
      expect(newState.isSaved).toBeTruthy()
      expect(newState.isSaving).toBeFalsy()
      expect(newState.item).toBe(UpcomingEvent)
    })

    it('UPDATE_ITEM_ERROR', () => {
      action.type = 'UPDATE_ITEM_ERROR'
      action.payload = itemError
      const newState = itemReducer(state, action)

      expect(newState.error).toBe(itemError)
      expect(newState.isSaving).toBeFalsy()
    })
  })

  describe('DELETE_ITEM', () => {
    it('DELETE_ITEM_PENDING', () => {
      action.type = 'DELETE_ITEM_PENDING'
      const newState = itemReducer(state, action)

      expect(newState.loading).toBeTruthy()
    })

    it('DELETE_ITEM_SUCCESS', () => {
      action.type = 'DELETE_ITEM_SUCCESS'
      const newState = itemReducer(state, action)

      expect(newState.loading).toBeTruthy()
    })

    it('DELETE_ITEM_ERROR', () => {
      action.type = 'DELETE_ITEM_ERROR'
      state.item = UpcomingEvent
      const newState = itemReducer(state, action)

      expect(newState.item).toEqual(UpcomingEvent)
      expect(newState.loading).toBeFalsy()
    })
  })

  it('RESET_ITEM', () => {
    action.type = 'RESET_ITEM'
    state.item = UpcomingEvent
    state.error = itemError
    const newState = itemReducer(state, action)

    expect(newState.error).toBe(null)
    expect(newState.isSaved).toBeTruthy()
    expect(newState.isSaving).toBeFalsy()
    expect(newState.item).toEqual({})
    expect(newState.loading).toBeFalsy()
    expect(newState.uploading).toBeFalsy()
    expect(newState.model).toBe(null)
  })
})
