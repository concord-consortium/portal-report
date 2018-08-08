import React from 'react'
import { expect } from 'chai'
import { describe, it } from 'mocha'
import { shallow } from 'enzyme'
import { fromJS } from 'immutable'
import ActivityQuestions from '../../../js/components/dashboard/activity-questions'

describe('<ActivityQuestions />', () => {
  const prompt1 = '1st question prompt'
  const prompt2 = '2nd question prompt (not visible)'
  const activity = fromJS({ questions: [
    { id: 1, visible: true, prompt: prompt1, questionNumber: '1' },
    { id: 2, visible: false, prompt: prompt2, questionNumber: '2' }
  ]})
  const expandedQuestions = fromJS({})
  describe('when activity is expanded', () => {
    describe('when questions are not expanded', () => {
      it('should render prompts of the visible questions', () => {
        const wrapper = shallow(
          <ActivityQuestions
            expanded
            activity={activity}
            expandedQuestions={expandedQuestions}
          />)
        expect(wrapper.html()).to.contain('Q1.')
        expect(wrapper.contains('Q2.')).to.equal(false)
        expect(wrapper.contains(prompt1)).to.equal(false)
      })
    })
    describe('when first question is expanded', () => {
      it('should render prompts of the visible questions', () => {
        const expandedQuestions = fromJS({1: true})
        const wrapper = shallow(
          <ActivityQuestions
            expanded
            activity={activity}
            expandedQuestions={expandedQuestions}
          />)
        expect(wrapper.html()).to.contain('Q1.')
        expect(wrapper.contains('Q2.')).to.equal(false)
        expect(wrapper.contains(prompt1)).to.equal(true)
      })
    })
  })
})
