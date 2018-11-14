import * as settingsActions from '../settings'
import * as types from '../index'
import { UpcomingEvent } from 'client/tests/fixtures/events'

jest.mock('isomorphic-fetch')

describe('Settings', () => {
  let dispatch

  beforeEach(() => {
    dispatch = jest.fn()
  })

  global.fetch = jest.fn(() =>
    Promise.resolve({
      status: 200,
      ok: true,
      json: () => Promise.resolve(UpcomingEvent)
    })
  )

  it('#fetchSettings gets settings at expected endpoint', async done => {
    try {
      await settingsActions.fetchSettings()(dispatch)
      expect(global.fetch.mock.calls[0][0]).toMatch('/api/settings')
      expect(dispatch.mock.calls[0][0].type).toBe('FETCH_SETTINGS_REQUESTED')
      expect(dispatch.mock.calls[1][0].type).toBe('FETCH_SETTINGS_SUCCESS')
      expect(dispatch.mock.calls[1][0].payload.settings).toEqual(UpcomingEvent)
      done()
    } catch (err) {
      console.warn(err)
    }
  })

  it('#fetchSettings can catch an error', async done => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        status: 404,
        ok: false,
        json: () => Promise.reject(new Error('Not found'))
      })
    )

    try {
      await settingsActions.fetchSettings()(dispatch)
      expect(global.fetch.mock.calls[0][0]).toMatch('/api/settings')
      expect(dispatch.mock.calls[0][0].type).toBe('FETCH_SETTINGS_REQUESTED')
      expect(dispatch.mock.calls[1][0].type).toBe('FETCH_SETTINGS_ERROR')
      expect(dispatch.mock.calls[1][0].payload.error.message).toBe('Error: Not found')
      done()
    } catch (err) {
      console.log(err)
    }
  })

  it('#updateSettings puts new settings', () => {
    expect(
      settingsActions.updateSettings({_id: '5a0a60d48dcb886c6a1ab1df'})
    ).toEqual(
      {
        type: types.API,
        payload: {
          method: 'put',
          data: {_id: '5a0a60d48dcb886c6a1ab1df'},
          url: '/settings/5a0a60d48dcb886c6a1ab1df',
          next: types.UPDATE_SETTINGS
        }
      }
    )
  })
})
