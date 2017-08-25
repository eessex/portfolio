import { API, FETCH_UPLOAD } from '../actions';

export const fetchUpload = (file) => {
	debugger
  return {
    type: API,
    payload: {
      method: 'post',
      url: '/upload',
      data: {fileName: file.name, fileType: file.type},
      next: FETCH_UPLOAD
    }
  }
}
