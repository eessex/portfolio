import { API, FETCH_UPLOAD } from '../actions'

export const getUploadSignature = (file, data, cb) => {
  const { name, type } = file

  return {
    type: API,
    payload: {
      method: 'post',
      url: '/upload',
      data: { fileName: name, fileType: type },
      next: FETCH_UPLOAD,
      cb: cb,
      file: file
    }
  }
}
