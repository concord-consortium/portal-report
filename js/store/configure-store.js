import { createStore, applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'
import apiMiddleware from '../api-middleware'
import rootReducer from '../reducers'
// import createLogger from 'redux-logger'

export default function configureStore (initialState) {
  return createStore(
    rootReducer,
    initialState,
    // apiMiddleware can now use thunk when calling `next()`
    applyMiddleware(apiMiddleware, thunkMiddleware) //, createLogger())
  )
}
