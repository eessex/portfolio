import { UpcomingEvent } from 'client/tests/fixtures/events'
import * as itemsActions from '../items'
import * as types from '../index'

jest.mock('isomorphic-fetch')

describe('Items', () => {
  let dispatch

  beforeEach(() => {
    dispatch = jest.fn()
  })
  // @ts-ignore
  global.fetch = jest.fn(() =>
    Promise.resolve({
      status: 200,
      ok: true,
      json: () => Promise.resolve([UpcomingEvent])
    })
  )

  it('#createItem posts to expected model', () => {
    expect(
      itemsActions.createItem('events')
    ).toEqual(
      {
        type: types.API,
        payload: {
          method: 'post',
          data: {},
          url: '/events',
          next: types.CREATE_ITEM
        }
      }
    )
  })

  describe('#fetchItems', () => {
    it('#fetchItem gets item at expected endpoint', async done => {
      try {
        await itemsActions.fetchItems('/events')(dispatch)
        // @ts-ignore
        expect(global.fetch.mock.calls[0][0]).toMatch('/api/events')
        expect(dispatch.mock.calls[0][0].type).toBe('FETCH_ITEMS_REQUESTED')
        expect(dispatch.mock.calls[1][0].type).toBe('FETCH_ITEMS_SUCCESS')
        expect(dispatch.mock.calls[1][0].payload.items[0]).toEqual(UpcomingEvent)
        done()
      } catch (err) { console.warn(err) }
    })

    it('#fetchItem can catch an error', async done => {
      // @ts-ignore
      global.fetch = jest.fn(() =>
        Promise.resolve({
          status: 500,
          json: () => Promise.reject(new Error('Bad request'))
        })
      )
      try {
        await itemsActions.fetchItems('/events')(dispatch)
        // @ts-ignore
        expect(global.fetch.mock.calls[0][0]).toMatch('/api/events')
        expect(dispatch.mock.calls[0][0].type).toBe('FETCH_ITEMS_REQUESTED')
        expect(dispatch.mock.calls[1][0].type).toBe('FETCH_ITEMS_ERROR')
        expect(dispatch.mock.calls[1][0].payload.error.message).toBe('Error: 500')
        done()
      } catch (err) { console.warn(err) }
    })
  })

  it('#resetItems', () => {
    expect(itemsActions.resetItems()).toEqual({
      type: 'RESET_ITEMS'
    })
  })
})
