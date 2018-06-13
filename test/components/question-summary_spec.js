import React from 'react'
import ReactDOM from 'react-dom'
import { renderIntoDocument, findRenderedDOMComponentWithClass } from 'react-addons-test-utils'
import {expect} from 'chai'
import {List, Map, fromJS} from 'immutable'
import {Provider} from 'react-redux'
import configureStore from 'redux-mock-store'

const mockStore = configureStore()

import QuestionSummary from '../../js/components/report/question-summary'

describe('QuestionSummary', () => {
  const prompt = "Why is the sky blue?"
  const answers = fromJS([
    {type: 'Embeddable::MultipleChoice'},
    {type: 'NoAnswer'},
    {type: 'Embeddable::OpenResponse'}
  ])
  const question  = Map({
    prompt: prompt,
    answers: answers
  })


  it('should have the specified prompt', () => {
    const component = renderIntoDocument(
      <Provider store={mockStore(fromJS({feedbacks:{}}))}>
        <QuestionSummary question={question} answers={List()}/>
      </Provider>
    )
    const promptComp = findRenderedDOMComponentWithClass(component, 'prompt')
    expect(promptComp.textContent).to.equal(prompt)
  })

  it('should have a summary of answered questions', () => {
    const component = renderIntoDocument(
      <Provider store={mockStore(fromJS({feedbacks:{}}))}>
        <QuestionSummary question={question} answers={question.get('answers')}/>
      </Provider>
    )
    const statsComp = findRenderedDOMComponentWithClass(component, 'stats')
    expect(statsComp.textContent).to.include("Not answered: 1")
  })
})