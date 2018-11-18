import * as pageActions from '../page'
import { HomePage } from 'client/tests/fixtures/pages'

jest.mock('isomorphic-fetch')

describe('Page', () => {
  let dispatch

  beforeEach(() => {
    dispatch = jest.fn()
  })

  global.fetch = jest.fn(() =>
    Promise.resolve({
      status: 200,
      ok: true,
      json: () => Promise.resolve(HomePage)
    })
  )

  it('#fetchItem gets HomePage at expected endpoint', async done => {
    try {
      await pageActions.fetchPage(`/${HomePage.slug}`)(dispatch)
      expect(global.fetch.mock.calls[0][0]).toMatch('/api/pages/home')
      expect(dispatch.mock.calls[0][0].type).toBe('FETCH_PAGE_REQUESTED')
      expect(dispatch.mock.calls[1][0].type).toBe('FETCH_PAGE_SUCCESS')
      expect(dispatch.mock.calls[1][0].payload.page).toEqual(HomePage)
      done()
    } catch (err) {
      console.warn(err)
    }
  })

  it('#fetchItem can catch an error', async done => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        status: 404,
        ok: false,
        json: () => Promise.reject(new Error('Not found'))
      })
    )

    try {
      await pageActions.fetchPage(`/${HomePage.slug}`)(dispatch)
      expect(global.fetch.mock.calls[0][0]).toMatch('/api/pages/home')
      expect(dispatch.mock.calls[0][0].type).toBe('FETCH_PAGE_REQUESTED')
      expect(dispatch.mock.calls[1][0].type).toBe('FETCH_PAGE_ERROR')
      expect(dispatch.mock.calls[1][0].payload.error.message).toBe('Error: Not found')
      done()
    } catch (err) {
      console.log(err)
    }
  })
})
