import React from 'react'
import { shallow } from 'enzyme'
import { fromJS } from 'immutable'
import Answer, { NoAnswer, GenericAnswer } from '../../../js/components/dashboard/answer'
import MultipleChoiceAnswer from '../../../js/components/dashboard/multiple-choice-answer'

describe('<Answer />', () => {
  it('should render <NoAnswer> when answer is not submitted', () => {
    const answer = fromJS({ submitted: false })
    const wrapper = shallow(<Answer answer={answer} />)
    expect(wrapper.find(NoAnswer)).toHaveLength(1)
  })

  it('should render <GenericAnswer> when answer type is unknown', () => {
    const answer = fromJS({ submitted: true, type: 'UnknownType_123' })
    const wrapper = shallow(<Answer answer={answer} />)
    expect(wrapper.find(GenericAnswer)).toHaveLength(1)
  })

  it('should render <NoAnswer> when answer type is "NoAnswer"', () => {
    const answer = fromJS({ submitted: true, type: 'NoAnswer' })
    const wrapper = shallow(<Answer answer={answer} />)
    expect(wrapper.find(NoAnswer)).toHaveLength(1)
  })

  it('should render <MultipleChoiceAnswer> when answer type is "Embeddable::MultipleChoice"', () => {
    const answer = fromJS({ submitted: true, type: 'Embeddable::MultipleChoice' })
    const wrapper = shallow(<Answer answer={answer} />)
    expect(wrapper.find(MultipleChoiceAnswer)).toHaveLength(1)
  })
})
