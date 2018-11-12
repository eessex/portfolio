import { combineReducers } from 'redux'
import { itemReducer } from './item'
import { itemsReducer } from './items'
import { pageReducer } from './page'
import { settingsReducer } from './settings'
import { userReducer } from './user'

export const rootReducer = combineReducers({
  itemReducer,
  itemsReducer,
  pageReducer,
  settingsReducer,
  userReducer
})
