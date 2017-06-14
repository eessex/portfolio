import eventsReducer from '../reducers/events'
import eventReducer from '../reducers/event'
import * as types from '../actions'

describe('events reducer', () => {
  it('should return the initial state', () => {
    expect(
      eventsReducer(undefined, {})
    ).toEqual({
      list: [],
      loading: false
    })
  })

  it('should handle FETCH_EVENTS', () => {
    expect(
      eventsReducer([], {
        type: types.FETCH_EVENTS.PENDING,
      })
    ).toEqual({loading: true})
    expect(
      eventsReducer([], {
        type: types.FETCH_EVENTS.SUCCESS,
        payload: [{id: '123'}]
      })
    ).toEqual({
    	list: [{id: '123'}],
    	loading: false
    })
  })
})

describe('event reducer', () => {
  it('should return the initial state', () => {
    expect(
      eventReducer(undefined, {})
    ).toEqual({
      error: null,
      event: {},
      loading: false,
      saving: null
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

  it('should handle CREATE_EVENT', () => {
    expect(
      eventReducer([], {
        type: types.CREATE_EVENT.PENDING,
      })
    ).toEqual({saving: true})
    expect(
      eventReducer([], {
        type: types.CREATE_EVENT.SUCCESS,
        payload: {data: {id: '123'}}
      })
    ).toEqual({
      event: {id: '123'},
      saving: false
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
        payload: {data: {id: '123'}}
      })
    ).toEqual({
      event: {id: '123'},
      saving: false
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
      loading: false
    })
  })
})