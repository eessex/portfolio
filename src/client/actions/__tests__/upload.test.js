import { fetchUpload } from '../upload'
import * as types from '../index'

describe('Upload', () => {
  it('#fetchUpload', () => {
    const data = {
      name: 'file.jpg',
      type: 'image/jpg'
    }
    const cb = jest.fn()
    const { type, payload } = fetchUpload(data, {}, cb)

    expect(type).toBe('API')
    expect(payload.method).toBe('post')
    expect(payload.url).toBe('/upload')
    expect(payload.next).toBe(types.FETCH_UPLOAD)
    expect(payload.data.fileName).toBe(data.name)
    expect(payload.data.fileType).toBe(data.type)
    expect(payload.cb).toBe(cb)
  })
})
