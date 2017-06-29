import { createStore, applyMiddleware } from 'redux';
import rootReducer from '../reducers'
import apiMiddleware from '../middleware/api';
import logMiddleware from '../middleware/log';
import { loadState } from '../localstorage'

const persistedState = loadState()

export default createStore(
  rootReducer,
<<<<<<< HEAD
  persistedState,
=======
>>>>>>> 719e91f8e1fe1624afe10a3d3334686fd923ce04
  applyMiddleware(apiMiddleware)
);
