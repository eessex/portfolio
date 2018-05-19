import { combineReducers } from 'redux'
import itemReducer from './item'
import itemsReducer from './items'
import publicationsReducer from './publications'
import settingsReducer from './settings'
import userReducer from './user'

const rootReducer = combineReducers({
  item: itemReducer,
  items: itemsReducer,
  publications: publicationsReducer,
  settings: settingsReducer,
  user: userReducer
})

export default rootReducer
