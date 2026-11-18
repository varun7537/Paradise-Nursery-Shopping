// /src/redux/store.js

import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk'; // Middleware for async actions
import userReducer from './reducers/userReducer';

const rootReducer = combineReducers({
  user: userReducer,  // The state slice for user
});

const store = createStore(rootReducer, applyMiddleware(thunk));

export default store;
