import 'babel-polyfill'
import { Provider } from 'react-redux'
import React from 'react'
import { render } from 'react-dom'
import App from './containers/app'
import configureStore from './store/configure-store'

const store = configureStore()
window.store = store

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('app')
)
