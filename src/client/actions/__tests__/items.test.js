import * as itemsActions from '../items'
import * as types from '../index'

describe('Items', () => {
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

  xdescribe('#fetchItems', () => {
    it('Gets items of expected model (admin)', () => {
      expect(
        itemsActions.fetchItems('projects', {published: true})
      ).toEqual(
        {
          type: types.API,
          payload: {
            method: 'get',
            url: '/projects',
            next: types.FETCH_ITEMS,
            query: {
              published: true
            }
          }
        }
      )
    })

    it('Gets items of expected model (anon)', () => { 
      expect(
        itemsActions.fetchItems('events', {published: false})
      ).toEqual(
        {
          type: types.API,
          payload: {
            method: 'get',
            url: '/events',
            next: types.FETCH_ITEMS,
            query: {
              published: false
            }
          }
        }
      )
    })
  })
})
