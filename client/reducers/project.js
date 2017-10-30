import {
  FETCH_PROJECT,
  UPDATE_PROJECT,
  CREATE_PROJECT,
  DELETE_PROJECT,
  RESET_PROJECT,
  FETCH_UPLOAD,
  RESET_UPLOAD
} from '../actions'

const initialState = {
  project: {},
  loading: false,
  uploading: false,
  saving: false,
  upload: {}
}

const projectReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_PROJECT.PENDING:
      return Object.assign({}, state, {
        loading: true
      })

    case FETCH_PROJECT.SUCCESS:
      return Object.assign({}, state, {
        loading: false,
        project: action.payload
      })

    case FETCH_PROJECT.ERROR:
      return Object.assign({}, state, {
        loading: false
      })

    case UPDATE_PROJECT.PENDING:
      return Object.assign({}, state, {
        saving: true,
        project: state.project
      })

    case UPDATE_PROJECT.SUCCESS:
      return Object.assign({}, state, {
        saving: false,
        project: action.payload.project,
        error: null
      })

    case UPDATE_PROJECT.ERROR:
      return Object.assign({}, state, {
        saving: false,
        error: action.payload.data,
        project: state.project
      })

    case CREATE_PROJECT.PENDING:
      return Object.assign({}, state, {
        saving: true,
        project: state.project
      })

    case CREATE_PROJECT.SUCCESS:
      return Object.assign({}, state, {
        saving: false,
        project: action.payload.project,
        error: null
      })

    case CREATE_PROJECT.ERROR:
      return Object.assign({}, state, {
        saving: false,
        error: action.payload.data,
        project: state.project
      })

    case DELETE_PROJECT.PENDING:
      return Object.assign({}, state, {
        loading: true,
        project: state.project
      })

    case DELETE_PROJECT.SUCCESS:
      return Object.assign({}, state, {
        loading: true
      })

    case DELETE_PROJECT.ERROR:
      return Object.assign({}, state, {
        loading: false,
        project: state.project
      })

    case RESET_PROJECT:
      return Object.assign({}, state, {
        loading: false,
        uploading: false,
        project: state.project
      })

    case FETCH_UPLOAD.PENDING:
      return Object.assign({}, state, {
        uploading: true
      })

    case FETCH_UPLOAD.SUCCESS:
      return Object.assign({}, state, {
        uploading: false,
        upload: action.payload
      })

    case FETCH_UPLOAD.ERROR:
      return Object.assign({}, state, {
        uploading: false
      })
    case RESET_UPLOAD:
      return initialState

    default:
      return state
  }
}

export default projectReducer