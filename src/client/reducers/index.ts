import { connectRouter } from 'connected-react-router'
import { combineReducers } from 'redux'
import { itemReducer } from './item'
import { itemsReducer } from './items'
import { pageReducer } from './page'
import { settingsReducer } from './settings'
import { userReducer } from './user'

export const createRootReducer = (history) => combineReducers({
  router: connectRouter(history),
  itemReducer,
  itemsReducer,
  pageReducer,
  settingsReducer,
  userReducer
})
