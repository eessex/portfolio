import { createStore, applyMiddleware } from 'redux';
import rootReducer from '../reducers'
import apiMiddleware from '../middleware/api';
import logMiddleware from '../middleware/log';

export default createStore(
  rootReducer,
  applyMiddleware(logMiddleware, apiMiddleware)
);
