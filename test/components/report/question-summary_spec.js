import React from 'react'
import { renderIntoDocument, findRenderedDOMComponentWithClass } from 'react-dom/test-utils'
import { List, Map, fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureStore from 'redux-mock-store'
import QuestionSummary from '../../../js/components/report/question-summary'

const mockStore = configureStore()

describe('<QuestionSummary />', () => {
  const prompt = 'Why is the sky blue?'
  const answers = fromJS([
    {type: 'Embeddable::MultipleChoice'},
    {type: 'NoAnswer'},
    {type: 'Embeddable::OpenResponse'}
  ])
  const question = Map({
    prompt: prompt,
    answers: answers
  })

  it('should have the specified prompt', () => {
    const component = renderIntoDocument(
      <Provider store={mockStore(fromJS({feedbacks: {}}))}>
        <QuestionSummary question={question} answers={List()} />
      </Provider>
    )
    const promptComp = findRenderedDOMComponentWithClass(component, 'prompt')
    expect(promptComp.textContent).toBe(prompt)
  })

  it('should have a summary of answered questions', () => {
    const component = renderIntoDocument(
      <Provider store={mockStore(fromJS({feedbacks: {}}))}>
        <QuestionSummary question={question} answers={question.get('answers')} />
      </Provider>
    )
    const statsComp = findRenderedDOMComponentWithClass(component, 'stats')
    expect(statsComp.textContent).toEqual(expect.stringContaining('Not answered: 1'))
  })
})
