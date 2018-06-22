import React from 'react'
import { expect } from 'chai'
import { describe, it } from 'mocha'
import { shallow, render } from 'enzyme'
import { fromJS } from 'immutable'
import MultipleChoiceAnswer, { Choice } from '../../../js/components/dashboard/multiple-choice-answer'

describe('<MultipleChoiceAnswer />', () => {
  describe('when showFullAnswer prop is false and selected answer is correct', () => {
    it('should render checkmark icon only', () => {
      const answer = fromJS({ answer: [ { id: 1, choice: 'choice_1' } ], isCorrect: true })
      const question = fromJS({ choices: [ { id: 1, choice: 'choice_1', isCorrect: true }, { id: 2, choice: 'choice_2', isCorrect: false } ] })
      const wrapper = render(<MultipleChoiceAnswer showFullAnswer={false} question={question} answer={answer} />)
      expect(wrapper.find(Choice)).to.have.length(0)
      expect(wrapper.find('.icomoon-checkmark')).to.have.length(1)
    })
  })

  describe('when showFullAnswer prop is false and selected answer is incorrect', () => {
    it('should render cross icon only', () => {
      const answer = fromJS({ answer: [ { id: 2, choice: 'choice_2' } ], isCorrect: false })
      const question = fromJS({ choices: [ { id: 1, choice: 'choice_1', isCorrect: true }, { id: 2, choice: 'choice_2', isCorrect: false } ] })
      const wrapper = render(<MultipleChoiceAnswer showFullAnswer={false} question={question} answer={answer} />)
      expect(wrapper.find(Choice)).to.have.length(0)
      expect(wrapper.find('.icomoon-cross')).to.have.length(1)
    })
  })

  describe('when showFullAnswer prop is false and there is no correct or incorrect answer', () => {
    it('should render checkmark icon only', () => {
      const answer = fromJS({ answer: [ { id: 2, choice: 'choice_2' } ] })
      const question = fromJS({ choices: [ { id: 1, choice: 'choice_1', isCorrect: null }, { id: 2, choice: 'choice_2', isCorrect: null } ] })
      const wrapper = render(<MultipleChoiceAnswer showFullAnswer={false} question={question} answer={answer} />)
      expect(wrapper.find(Choice)).to.have.length(0)
      expect(wrapper.find('.icomoon-checkmark2')).to.have.length(1)
    })
  })

  describe('when showFullAnswer prop is true', () => {
    it('should render all the choices and select one selected by student', () => {
      const answer = fromJS({ answer: [ { id: 1, choice: 'choice_1' } ] })
      const question = fromJS({ choices: [ { id: 1, choice: 'choice_1' }, { id: 2, choice: 'choice_2' } ] })
      const wrapper = shallow(<MultipleChoiceAnswer showFullAnswer question={question} answer={answer} />)
      expect(wrapper.find(Choice)).to.have.length(2)
      expect(wrapper.find(Choice).at(0).prop('choice')).to.equal(question.get('choices').get(0))
      expect(wrapper.find(Choice).at(0).prop('selected')).to.equal(true)
      expect(wrapper.find(Choice).at(1).prop('choice')).to.equal(question.get('choices').get(1))
      expect(wrapper.find(Choice).at(1).prop('selected')).to.equal(false)
    })
  })
})
