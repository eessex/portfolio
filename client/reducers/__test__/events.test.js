import eventsReducer from '../events.js'
import * as types from '../../actions'

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
  it('should handle CREATE_EVENT', () => {
    expect(
      eventsReducer([], {
        type: types.CREATE_EVENT.PENDING,
      })
    ).toEqual({loading: true})
    expect(
      eventsReducer({list:[]}, {
        type: types.CREATE_EVENT.SUCCESS,
        payload: {event: {id: '123'}}
      })
    ).toEqual({
      error: null,
      list: [{id: "123"}],
      loading: false
    })
  })
})
