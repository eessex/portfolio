import { cloneDeep } from 'lodash'
import {
  FETCH_PAGE_ERROR,
  FETCH_PAGE_REQUESTED,
  FETCH_PAGE_SUCCESS,
  RESET_PAGE
} from 'client/actions/page'
import { HomePage } from 'client/tests/fixtures/pages'
import { pageReducer, initialState } from '../page'

describe('pageReducer', () => {
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

  const pagePayload = { page: HomePage }
  const pageError = { message: '404 Not found' }

  describe('FETCH_ITEM', () => {
    it('FETCH_PAGE_REQUESTED', () => {
      action.type = FETCH_PAGE_REQUESTED
      const newState = pageReducer(state, action)

      expect(newState.loading).toBeTruthy()
    })

    it('FETCH_PAGE_SUCCESS', () => {
      action.type = FETCH_PAGE_SUCCESS
      action.payload = pagePayload
      state.loading = true
      state.error = pageError
      const newState = pageReducer(state, action)

      expect(newState.loading).toBeFalsy()
      expect(newState.error).toBe(null)
      expect(newState.page).toEqual(HomePage)
    })

    it('FETCH_PAGE_ERROR', () => {
      action.type = FETCH_PAGE_ERROR
      action.payload.error = pageError
      const newState = pageReducer(state, action)

      expect(newState.error).toBe(pageError)
      expect(newState.loading).toBeFalsy()
      expect(newState.page).toEqual({})
    })
  })

  it('RESET_PAGE', () => {
    action.type = RESET_PAGE
    state.page = HomePage
    state.error = pageError
    const newState = pageReducer(state, action)

    expect(newState.error).toBe(null)
    expect(newState.page).toEqual({})
    expect(newState.loading).toBeFalsy()
  })
})
