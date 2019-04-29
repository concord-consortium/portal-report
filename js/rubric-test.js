import 'babel-polyfill'
import React from 'react'
import { render } from 'react-dom'
import RubricTest from './containers/authoring/rubric-test'

render(
  <RubricTest />,
  document.getElementById('app')
)
