import { createStore, applyMiddleware, compose } from "redux";
import thunkMiddleware from "redux-thunk";
import apiMiddleware from "../api-middleware";
import rootReducer from "../reducers";
// import createLogger from 'redux-logger'

export default function configureStore(initialState) {
  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

  return createStore(
    rootReducer,
    initialState,
    // apiMiddleware can now use thunk when calling `next()`
    composeEnhancers( applyMiddleware(apiMiddleware, thunkMiddleware)), //, createLogger())
  );
}
