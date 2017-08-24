import { API, FETCH_SIGNATURE } from '../actions';

export const fetchSignature = () => {
  return {
    type: API,
    payload: {
      method: 'get',
      url: '/uploads',
      next: FETCH_SIGNATURE
    }
  }
}

// export const resetSignature = () => {
//   return {
//     type: RESET_SIGNATURE
//   }
// }