import React from 'react';
import ReactDOM from 'react-dom';
import { renderIntoDocument, findRenderedDOMComponentWithClass } from 'react-addons-test-utils';
import {expect} from 'chai';
import {List, Map} from 'immutable'

import QuestionSummary from '../../js/components/question-summary';

describe('QuestionSummary', () => {
  const prompt    = "Why is the sky blue?"
  const answers   = [
    {type: 'Embeddable::MultipleChoice'},
    {type: 'NoAnswer'},
    {type: 'Embeddable::OpenResponse'}
  ]
  const question  = Map({
    prompt: prompt,
    answers: List(answers)
  })

  it('should have the specified prompt', () => {
    const component = renderIntoDocument( <QuestionSummary question={question} /> )
    const promptComp = findRenderedDOMComponentWithClass(component, 'prompt')
    expect(promptComp.textContent).to.equal(prompt)
  })

  it('should have a summary of answered questions', () => {
    const component = renderIntoDocument( <QuestionSummary question={question} /> )
    const statsComp = findRenderedDOMComponentWithClass(component, 'stats')
    expect(statsComp.textContent).to.include("Answered: 2")
    expect(statsComp.textContent).to.include("Not answered: 1")
    expect(statsComp.textContent).to.include("Total: 3")
  })
})