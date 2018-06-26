import React from 'react'
import { expect } from 'chai'
import { describe, it } from 'mocha'
import { shallow } from 'enzyme'
import { fromJS } from 'immutable'
import ActivityQuestions from '../../../js/components/dashboard/activity-questions'

describe('<ActivityQuestions />', () => {
  describe('when expanded', () => {
    it('should render prompts of the visible questions', () => {
      const prompt1 = '1st question prompt'
      const prompt2 = '2nd question prompt (not visible)'
      const activity = fromJS({ questions: [
        { id: 1, visible: true, prompt: prompt1 },
        { id: 2, visible: false, prompt: prompt2 }
      ]})
      const wrapper = shallow(<ActivityQuestions expanded activity={activity} />)
      expect(wrapper.contains(prompt1)).to.equal(true)
      expect(wrapper.contains(prompt2)).to.equal(false)
    })
  })
})
