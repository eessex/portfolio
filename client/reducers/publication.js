import {
  FETCH_PUBLICATION,
  UPDATE_PUBLICATION,
  DELETE_PUBLICATION,
  RESET_PUBLICATION,
  FETCH_UPLOAD,
  RESET_UPLOAD
} from '../actions'

const initialState = {
  publication: {},
  loading: false,
  uploading: false,
  saving: false,
  upload: {}
}

const publicationReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_PUBLICATION.PENDING:
      return Object.assign({}, state, {
        loading: true
      })

    case FETCH_PUBLICATION.SUCCESS:
      return Object.assign({}, state, {
        loading: false,
        publication: action.payload
      })

    case FETCH_PUBLICATION.ERROR:
      return Object.assign({}, state, {
        loading: false
      })

    case UPDATE_PUBLICATION.PENDING:
      return Object.assign({}, state, {
        saving: true,
        publication: state.publication
      })

    case UPDATE_PUBLICATION.SUCCESS:
      return Object.assign({}, state, {
        saving: false,
        publication: action.payload.publication,
        error: null
      })

    case UPDATE_PUBLICATION.ERROR:
      return Object.assign({}, state, {
        saving: false,
        error: action.payload.data,
        publication: state.publication
      })

    case DELETE_PUBLICATION.PENDING:
      return Object.assign({}, state, {
        loading: true,
        publication: state.publication
      })

    case DELETE_PUBLICATION.SUCCESS:
      return Object.assign({}, state, {
        loading: true
      })

    case DELETE_PUBLICATION.ERROR:
      return Object.assign({}, state, {
        loading: false,
        publication: state.publication
      })

    case RESET_PUBLICATION:
      return Object.assign({}, state, {
        loading: false,
        uploading: false,
        publication: state.publication
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

export default publicationReducer