import React from 'react'
import { assert, expect } from 'chai'
import { describe, it } from 'mocha'
import { mount } from 'enzyme'
import sinon from 'sinon'
import { fromJS } from 'immutable'
import ExpandStudents from '../../../js/components/dashboard/expand-students'

describe('<ExpandStudents />', () => {
  it('should be labelled correctly on load', () => {
    const wrapper = mount(<ExpandStudents />)
    expect(wrapper.text()).to.equal('Open Students')
  })

  it('should open students if all are closed', () => {
    const students = fromJS([{id: 42}])
    const expandedStudents = fromJS({42: false})
    const onClick = sinon.spy()
    const wrapper = mount(<ExpandStudents setStudentsExpanded={onClick} students={students} expandedStudents={expandedStudents} />)

    expect(wrapper.text()).to.equal('Open Students')
    const button = wrapper.find('Button')
    button.simulate('click')
    assert(onClick.calledOnce)
    const args = onClick.getCall(0).args
    expect(args[0].toJS()).to.deep.equal([42])
    expect(args[1]).to.equal(true)
  })

  it('should close students if any are open', () => {
    const students = fromJS([{id: 42}, {id: 43}])
    const expandedStudents = fromJS({42: true, 43: false})
    const onClick = sinon.spy()
    const wrapper = mount(<ExpandStudents setStudentsExpanded={onClick} students={students} expandedStudents={expandedStudents} />)
    
    expect(wrapper.text()).to.equal('Close Students')
    const button = wrapper.find('Button')
    button.simulate('click')
    assert(onClick.calledOnce)
    const args = onClick.getCall(0).args
    expect(args[0].toJS()).to.deep.equal([42, 43])
    expect(args[1]).to.equal(false)
  })
})
