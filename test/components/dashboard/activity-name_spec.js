import React from 'react'
import { expect } from 'chai'
import { describe, it } from 'mocha'
import { shallow } from 'enzyme'
import sinon from 'sinon'
import { fromJS } from 'immutable'
import ActivityName from '../../../js/components/dashboard/activity-name'

describe('<ActivityName />', () => {
  it('should render activity name', () => {
    const name = 'Test activity'
    const activity = fromJS({ name })
    const wrapper = shallow(<ActivityName activity={activity} number={1} />)
    expect(wrapper.text()).to.include(name)
    expect(wrapper.text()).to.include('Act 1')
    expect(wrapper.text()).not.to.include('Act 2')
  })
  it('should call setActivityExpanded when user clicks on it', () => {
    const onClick = sinon.spy()
    const wrapper = shallow(<ActivityName setActivityExpanded={onClick} trackEvent={onClick} />)
    wrapper.simulate('click')
    expect(onClick.firstCall.calledWith()).to.equal(true)
  })
})
