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
    describe('and isCorrect properties are equal to `null`', () => {
      it('should render empty checkmark icon only', () => {
        const answer = fromJS({ answer: [ { id: 2, choice: 'choice_2' } ], isCorrect: null })
        const question = fromJS({ choices: [ { id: 1, choice: 'choice_1', isCorrect: null }, { id: 2, choice: 'choice_2', isCorrect: null } ] })
        const wrapper = render(<MultipleChoiceAnswer showFullAnswer={false} question={question} answer={answer} />)
        expect(wrapper.find(Choice)).to.have.length(0)
        expect(wrapper.find('.icomoon-checkmark2')).to.have.length(1)
      })
    })
    describe('and isCorrect properties are equal to `false`', () => {
      it('should render empty checkmark icon only', () => {
        const answer = fromJS({ answer: [ { id: 2, choice: 'choice_2' } ], isCorrect: false })
        const question = fromJS({ choices: [ { id: 1, choice: 'choice_1', isCorrect: false }, { id: 2, choice: 'choice_2', isCorrect: false } ] })
        const wrapper = render(<MultipleChoiceAnswer showFullAnswer={false} question={question} answer={answer} />)
        expect(wrapper.find(Choice)).to.have.length(0)
        expect(wrapper.find('.icomoon-checkmark2')).to.have.length(1)
      })
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

  describe('when there is no choice with isCorrect property equal to `true`', () => {
    it('should pass `correctAnswerDefined=false` prop to choices', () => {
      const answer = fromJS({ answer: [ { id: 1, choice: 'choice_1' } ] })
      const question = fromJS({ choices: [ { id: 1, choice: 'choice_1', isCorrect: false }, { id: 2, choice: 'choice_2', isCorrect: false } ] })
      const wrapper = shallow(<MultipleChoiceAnswer showFullAnswer question={question} answer={answer} />)
      expect(wrapper.find(Choice)).to.have.length(2)
      expect(wrapper.find(Choice).at(0).prop('correctAnswerDefined')).to.equal(false)
      expect(wrapper.find(Choice).at(1).prop('correctAnswerDefined')).to.equal(false)
    })
  })

  describe('when there is at least one choice with isCorrect property equal to `true`', () => {
    it('should pass `correctAnswerDefined=true` prop to choices', () => {
      const answer = fromJS({ answer: [ { id: 1, choice: 'choice_1' } ] })
      const question = fromJS({ choices: [ { id: 1, choice: 'choice_1', isCorrect: true }, { id: 2, choice: 'choice_2', isCorrect: false } ] })
      const wrapper = shallow(<MultipleChoiceAnswer showFullAnswer question={question} answer={answer} />)
      expect(wrapper.find(Choice)).to.have.length(2)
      expect(wrapper.find(Choice).at(0).prop('correctAnswerDefined')).to.equal(true)
      expect(wrapper.find(Choice).at(1).prop('correctAnswerDefined')).to.equal(true)
    })
  })
})

describe('<Choice />', () => {
  it('should render choice text', () => {
    const choice = fromJS({ id: 1, choice: 'choice_12345' })
    const wrapper = shallow(<Choice choice={choice} />)
    expect(wrapper.contains('choice_12345')).to.equal(true)
  })

  describe('when it is not selected', () => {
    it('should render unchecked icon', () => {
      const choice = fromJS({ id: 1, choice: 'choice_12345' })
      const wrapper = shallow(<Choice selected={false} choice={choice} />)
      expect(wrapper.find('.icomoon-radio-unchecked')).to.have.length(1)
    })
  })

  describe('when student answer is correct', () => {
    it('should render filled checkmark icon', () => {
      const choice = fromJS({ id: 1, choice: 'choice_12345', isCorrect: true })
      const wrapper = shallow(<Choice selected correctAnswerDefined choice={choice} />)
      expect(wrapper.find('.icomoon-checkmark')).to.have.length(1)
    })
  })

  describe('when student answer is incorrect', () => {
    it('should render cross icon', () => {
      const choice = fromJS({ id: 1, choice: 'choice_12345', isCorrect: false })
      const wrapper = shallow(<Choice selected correctAnswerDefined choice={choice} />)
      expect(wrapper.find('.icomoon-cross')).to.have.length(1)
    })
  })

  describe('when there is no correct answer defined', () => {
    describe('and isCorrect prop is equal to `false`', () => {
      it('should render empty checkmark icon', () => {
        const choice = fromJS({id: 1, choice: 'choice_12345', isCorrect: false })
        const wrapper = shallow(<Choice selected correctAnswerDefined={false} choice={choice} />)
        expect(wrapper.find('.icomoon-checkmark2')).to.have.length(1)
      })
    })
    describe('and isCorrect prop is equal to `null`', () => {
      it('should render empty checkmark icon', () => {
        const choice = fromJS({id: 1, choice: 'choice_12345', isCorrect: null })
        const wrapper = shallow(<Choice selected correctAnswerDefined={false} choice={choice} />)
        expect(wrapper.find('.icomoon-checkmark2')).to.have.length(1)
      })
    })
  })
})
