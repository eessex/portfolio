import { FETCH_PROJECTS, CREATE_PROJECT } from '../actions'

const initialState = {
  loading: false,
  list: []
}

const projectsReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_PROJECTS.PENDING:
      return Object.assign({}, state, {
        loading: true
      })

    case FETCH_PROJECTS.SUCCESS:
      return Object.assign({}, state, {
        loading: false,
        list: action.payload
      })

    case FETCH_PROJECTS.ERROR:
      return Object.assign({}, state, {
        loading: false
      })

    case CREATE_PROJECT.PENDING:
      return Object.assign({}, state, {
        loading: true,
      })

    case CREATE_PROJECT.SUCCESS:
      state.list.push(action.payload.project)

      return Object.assign({}, state, {
        loading: false,
        list: state.list,
        error: null
      })

    case CREATE_PROJECT.ERROR:
      return Object.assign({}, state, {
        loading: false,
        error: action.payload,
      })

    default:
      return state
  }
}

export default projectsReducer
