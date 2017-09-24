import { createStore, applyMiddleware } from 'redux'
import rootReducer from '../reducers'
import apiMiddleware from '../middleware/api'
import logMiddleware from '../middleware/log'
import { loadState } from '../localstorage'

const persistedState = loadState()

export default createStore(
  rootReducer,
  persistedState,
  applyMiddleware(apiMiddleware)
)
