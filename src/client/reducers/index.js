import { combineReducers } from 'redux'
import { itemReducer } from './item'
import { itemsReducer } from './items'
import { pageReducer } from './page'
import settingsReducer from './settings'
import userReducer from './user'

const rootReducer = combineReducers({
  itemReducer,
  itemsReducer,
  pageReducer,
  settings: settingsReducer,
  user: userReducer
})

export default rootReducer
