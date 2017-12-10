import eventReducer from '../event.js'
import * as types from '../../actions'

describe('event reducer', () => {
  it('should return the initial state', () => {
    expect(
      eventReducer(undefined, {})
    ).toEqual({
      event: {},
      loading: false,
      saving: false,
      upload: {},
      uploading: false
    })
  })

  it('should handle FETCH_EVENT', () => {
    expect(
      eventReducer([], {
        type: types.FETCH_EVENT.PENDING,
      })
    ).toEqual({loading: true})
    expect(
      eventReducer([], {
        type: types.FETCH_EVENT.SUCCESS,
        payload: {id: '123'}
      })
    ).toEqual({
    	event: {id: '123'},
    	loading: false
    })
  })

  it('should handle UPDATE_EVENT', () => {
    expect(
      eventReducer([], {
        type: types.UPDATE_EVENT.PENDING,
      })
    ).toEqual({saving: true})
    expect(
      eventReducer([], {
        type: types.UPDATE_EVENT.SUCCESS,
        payload: {event: {id: '123'}}
      })
    ).toEqual({
      event: {id: '123'},
      saving: false,
      error: null
    })
  })

  it('should handle DELETE_EVENT', () => {
    expect(
      eventReducer([], {
        type: types.DELETE_EVENT.PENDING,
      })
    ).toEqual({loading: true})
    expect(
      eventReducer([], {
        type: types.DELETE_EVENT.SUCCESS,
        payload: {data: {id: '123'}}
      })
    ).toEqual({
      loading: true
    })
  })
})