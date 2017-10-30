import { FETCH_PROJECTS } from '../actions'

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

    default:
      return state
  }
}

export default projectsReducer
