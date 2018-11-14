import { cloneDeep } from 'lodash'
import * as itemActions from '../item'
import * as types from '../index'
import { UpcomingEvent } from 'client/tests/fixtures/events'

jest.mock('isomorphic-fetch')

describe('Item', () => {
  let data
  let getState
  let dispatch

  beforeEach(() => {
    data = cloneDeep(UpcomingEvent)
    dispatch = jest.fn()
    getState = jest.fn(() => ({
      itemReducer: { item: data }
    }))
  })

  global.fetch = jest.fn(() =>
    Promise.resolve({
      status: 200,
      ok: true,
      json: () => Promise.resolve(UpcomingEvent)
    })
  )

  it('#changeItem gets item of expected model', () => {
    expect(
      itemActions.changeItem('title', 'new title')
    ).toEqual(
      {
        type: 'CHANGE_ITEM',
        payload: {
          key: 'title',
          value: 'new title'
        }
      }
    )
  })

  it('#fetchItem gets item at expected endpoint', async () => {
    try {
      await itemActions.fetchItem('/projects', data._id)(dispatch)
      expect(global.fetch.mock.calls[0][0]).toMatch('/api/projects/5a0a60d48dcb886c6a1ab1df')
      expect(dispatch.mock.calls[0][0].type).toBe('FETCH_ITEM_REQUESTED')
      expect(dispatch.mock.calls[1][0].type).toBe('FETCH_ITEM_SUCCESS')
      expect(dispatch.mock.calls[1][0].payload.item).toEqual(UpcomingEvent)
    } catch (err) {
      console.warn(err)
    }
  })

  it('#fetchItem can catch an error', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        status: 404,
        ok: false,
        json: () => Promise.reject(new Error({ message: 'Not found' }))
      })
    )

    try {
      await itemActions.fetchItem('/projects', data._id)(dispatch)
      expect(global.fetch.mock.calls[0][0]).toMatch('/api/projects/5a0a60d48dcb886c6a1ab1df')
      expect(dispatch.mock.calls[0][0].type).toBe('FETCH_ITEM_REQUESTED')
      expect(dispatch.mock.calls[1][0].type).toBe('FETCH_ITEM_ERROR')
      expect(dispatch.mock.calls[1][0].payload.error.message).toBe('Error: 404')
    } catch (err) {
      console.log(err)
    }
  })

  describe('#maybeSaveItem ', () => {
    it('Calls #updateItem published if not forceSave is true', () => {
      itemActions.maybeSaveItem('events', true)(dispatch, getState)
      const { payload, type } = dispatch.mock.calls[0][0]

      expect(type).toBe('API')
      expect(payload.method).toBe('put')
      expect(payload.url).toBe('/events/5a0a60d48dcb886c6a1ab1df')
      expect(payload.data._id).toBe('5a0a60d48dcb886c6a1ab1df')
      expect(payload.next).toBe(types.UPDATE_ITEM)
    })

    it('Calls #updateItem if not published', () => {
      data.published = false
      getState = jest.fn(() => ({
        itemReducer: { item: data }
      }))
      itemActions.maybeSaveItem('events', false)(dispatch, getState)
      const { payload, type } = dispatch.mock.calls[0][0]

      expect(type).toBe('API')
      expect(payload.method).toBe('put')
      expect(payload.url).toBe('/events/5a0a60d48dcb886c6a1ab1df')
      expect(payload.data._id).toBe('5a0a60d48dcb886c6a1ab1df')
      expect(payload.next).toBe(types.UPDATE_ITEM)
    })
  })

  it('#updateItem puts item of expected model', () => {
    expect(
      itemActions.updateItem('events', data)
    ).toEqual(
      {
        type: types.API,
        payload: {
          method: 'put',
          data,
          url: '/events/5a0a60d48dcb886c6a1ab1df',
          next: types.UPDATE_ITEM
        }
      }
    )
  })

  it('#deleteItem puts item of expected model', () => {
    const deleteItem = itemActions.deleteItem('events', data)

    expect(deleteItem).toEqual({
      type: types.API,
      payload: {
        method: 'delete',
        data,
        url: '/events/5a0a60d48dcb886c6a1ab1df',
        next: types.DELETE_ITEM
      }
    })
  })
})
