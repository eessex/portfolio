import { combineReducers } from 'redux'
import itemReducer from './item'
import itemsReducer from './items'
import publicationReducer from './publication'
import publicationsReducer from './publications'
import settingsReducer from './settings'
import userReducer from './user'

const rootReducer = combineReducers({
  item: itemReducer,
  items: itemsReducer,
  publication: publicationReducer,
  publications: publicationsReducer,
  settings: settingsReducer,
  user: userReducer
})

export default rootReducer
