import { cloneDeep } from 'lodash'
import {
  FETCH_SETTINGS_ERROR,
  FETCH_SETTINGS_REQUESTED,
  FETCH_SETTINGS_SUCCESS,
  RESET_SETTINGS
} from 'client/actions/settings'
import { initialState, settingsReducer } from '../settings'

describe('settingsReducer', () => {
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
  const settingsPayload = { settings: { _id: '12345' } }
  const settingsError = { message: '404 Not found' }

  describe('FETCH_SETTINGS', () => {
    it('FETCH_SETTINGS_REQUESTED', () => {
      action.type = FETCH_SETTINGS_REQUESTED
      const newState = settingsReducer(state, action)

      expect(newState.loading).toBeTruthy()
    })

    it('FETCH_SETTINGS_SUCCESS', () => {
      action.type = FETCH_SETTINGS_SUCCESS
      action.payload.settings = settingsPayload
      state.loading = true
      state.error = settingsError
      const newState = settingsReducer(state, action)

      expect(newState.loading).toBeFalsy()
      expect(newState.error).toBe(null)
      expect(newState.settings).toEqual(settingsPayload)
    })

    it('FETCH_SETTINGS_ERROR', () => {
      action.type = FETCH_SETTINGS_ERROR
      action.payload = settingsError
      const newState = settingsReducer(state, action)

      expect(newState.error).toBe(settingsError)
      expect(newState.loading).toBeFalsy()
      expect(newState.settings).toEqual({})
    })
  })

  describe('UPDATE_SETTINGS', () => {
    it('UPDATE_SETTINGS.PENDING', () => {
      action.type = 'UPDATE_SETTINGS_PENDING'
      const newState = settingsReducer(state, action)

      expect(newState.isSaving).toBeTruthy()
    })

    it('UPDATE_SETTINGS.SUCCESS', () => {
      action.type = 'UPDATE_SETTINGS_SUCCESS'
      action.payload = settingsPayload
      state.error = settingsError
      const newState = settingsReducer(state, action)

      expect(newState.error).toBe(null)
      expect(newState.isSaved).toBeTruthy()
      expect(newState.isSaving).toBeFalsy()
      expect(newState.settings).toBe(settingsPayload.settings)
    })

    it('UPDATE_SETTINGS.ERROR', () => {
      action.type = 'UPDATE_SETTINGS_ERROR'
      action.payload.data = settingsError
      const newState = settingsReducer(state, action)

      expect(newState.error).toBe(settingsError)
      expect(newState.isSaving).toBeFalsy()
    })
  })

  it('RESET_SETTINGS', () => {
    action.type = RESET_SETTINGS
    state.settings = settingsPayload
    state.error = settingsError
    const newState = settingsReducer(state, action)

    expect(newState.error).toBe(null)
    expect(newState.isSaved).toBeTruthy()
    expect(newState.isSaving).toBeFalsy()
    expect(newState.settings).toEqual({})
    expect(newState.loading).toBeFalsy()
  })
})
