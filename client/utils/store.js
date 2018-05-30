import { createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import rootReducer from '../reducers'
import apiMiddleware from '../middleware/api'
import logMiddleware from '../middleware/log'
import { loadState } from '../utils/local_storage.js'

const middleware = [
  thunk,
  logMiddleware,
  apiMiddleware
]

const persistedState = loadState()

export default createStore(
  rootReducer,
  persistedState,
  applyMiddleware(...middleware),
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
)
