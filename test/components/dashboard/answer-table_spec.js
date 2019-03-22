import React from 'react'
import { expect } from 'chai'
import { describe, it } from 'mocha'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import { renderIntoDocument, findRenderedDOMComponentWithClass } from 'react-addons-test-utils'
import AnswersTable from '../../../js/containers/report/answers-table'

describe('<AnswersTable />', () => {
  const question = fromJS({
    scoreEnabled: true,
    feedbackEnabled: true
  })
  const hidden = false
  const showCompare = false
  const anonymous = false
  const answers = fromJS([])
  const state = {}
  const store = { getState: () => fromJS(state), subscribe: () => {} }
  const params = { hidden, showCompare, anonymous, question, answers }

  describe('with a question', () => {
    it('should render <AnswersTable> with Score and Feedback text', () => {
      const component = renderIntoDocument(
        <Provider store={store} >
          <AnswersTable {...params} />
        </Provider>
      )
      const found = findRenderedDOMComponentWithClass(component, 'answers-table')
      expect(found.textContent).to.match(/Student/)
      expect(found.textContent).to.match(/Response/)
      expect(found.textContent).to.match(/Score/)
      expect(found.textContent).to.match(/Feedback/)
    })
  })

  describe('With out a question', () => {
    const question = null
    const params = { hidden, showCompare, anonymous, question, answers }

    it('should render <AnswersTable> without Score or Feedback text', () => {
      const component = renderIntoDocument(
        <Provider store={store} >
          <AnswersTable {...params} />
        </Provider>
      )
      const found = findRenderedDOMComponentWithClass(component, 'answers-table')
      expect(found.textContent).to.match(/Student/)
      expect(found.textContent).to.match(/Response/)
      expect(found.textContent).not.to.match(/Score/)
      expect(found.textContent).not.to.match(/Feedback/)
    })
  })
})
