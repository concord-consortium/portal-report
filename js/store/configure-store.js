import { createStore, applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'
import createLogger from 'redux-logger'
import apiMiddleware from '../api-middleware'
import rootReducer from '../reducers'

export default function configureStore(initialState) {
  return createStore(
    rootReducer,
    initialState,
    // apiMiddleware can now use thunk when calling `next()`
    applyMiddleware(apiMiddleware, thunkMiddleware) //, createLogger())
  )
}
