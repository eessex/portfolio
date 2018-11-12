import * as itemActions from '../item'
import * as types from '../index'
import { UpcomingEvent } from '../../tests/fixtures/events'

describe('Item', () => {
  let data
  let getState
  let dispatch

  beforeEach(() => {
    data = UpcomingEvent
    dispatch = jest.fn()
    getState = jest.fn(() => ({
      itemReducer: { item: data }
    }))
  })

  it('#changeItem gets item of expected model', () => {
    expect(
      itemActions.changeItem('title', 'new title')
    ).toEqual(
      {
        type: types.CHANGE_ITEM,
        payload: {
          key: 'title',
          value: 'new title'
        }
      }
    )
  })

  xit('#fetchItem gets item of expected model', () => {
    // FIXME
    // try {
    itemActions.fetchItem('projects', data._id)(dispatch).then(res =>
      console.log(res)
    )
    // console.log(dispatch.mock.calls)
    expect(dispatch.mock.calls[0][0].type).toBe('FETCH_ITEM_REQUESTED')
    // } catch (err) {
    //   console.log(err)
    // }
  })

  xit('#fetchItem can catch an error', async () => {
    // FIXME
    try {
      await itemActions.fetchItem('projects', data._id)(dispatch)
      // const theRes = await res(dispatch)
      expect(dispatch.mock.calls[1][0].type).toBe('FETCH_ITEM_ERROR')
    } catch (err) {
      console.log(err)
    }
  })

  it('#fetchUpload', () => {
    const data = {
      name: 'file.jpg',
      type: 'image/jpg'
    }
    const cb = jest.fn()
    const { type, payload } = itemActions.fetchUpload(data, {}, cb)

    expect(type).toBe('API')
    expect(payload.method).toBe('post')
    expect(payload.url).toBe('/upload')
    expect(payload.next).toBe(types.FETCH_UPLOAD)
    expect(payload.data.fileName).toBe(data.name)
    expect(payload.data.fileType).toBe(data.type)
    expect(payload.cb).toBe(cb)
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
