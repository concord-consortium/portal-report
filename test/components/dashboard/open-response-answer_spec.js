import React from 'react'
import { shallow, render } from 'enzyme'
import { fromJS } from 'immutable'
import OpenResponseAnswer from '../../../js/components/dashboard/open-response-answer'

describe('<OpenResponseAnswer />', () => {
  describe('when showFullAnswer prop is false', () => {
    it('should render text icon only', () => {
      const wrapper = render(<OpenResponseAnswer showFullAnswer={false} />)
      expect(wrapper.find('.icomoon-file-text')).toHaveLength(1)
      expect(wrapper.text()).toBe('')
    })
  })

  describe('when showFullAnswer prop is true', () => {
    it('should render the full answer text only', () => {
      const answer = fromJS({ answer: 'answer-text' })
      const wrapper = shallow(<OpenResponseAnswer showFullAnswer={true} answer={answer} />)
      expect(wrapper.text()).toBe('answer-text')
      expect(wrapper.find('.icomoon-file-text')).toHaveLength(0)
    })
  })
})
