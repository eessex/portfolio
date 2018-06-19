import { createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import rootReducer from 'client/reducers'
import apiMiddleware from 'client/middleware/api'
import logMiddleware from 'client/middleware/log'
import { loadState } from 'client/utils/local_storage'

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
