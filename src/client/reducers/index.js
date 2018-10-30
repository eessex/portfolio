import { combineReducers } from 'redux'
import itemReducer from './item'
import itemsReducer from './items'
import settingsReducer from './settings'
import userReducer from './user'

const rootReducer = combineReducers({
  item: itemReducer,
  itemsReducer: itemsReducer,
  settings: settingsReducer,
  user: userReducer
})

export default rootReducer
