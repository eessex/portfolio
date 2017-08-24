import { API, FETCH_SIGNATURE } from '../actions';

export const fetchSignature = (file) => {
	debugger
  return {
    type: API,
    payload: {
      method: 'post',
      url: '/uploads',
      data: {fileName: file.name, fileType: file.type},
      next: FETCH_SIGNATURE
    }
  }
}
