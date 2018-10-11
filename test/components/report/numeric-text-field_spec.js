import React from 'react'
import { expect } from 'chai'
import { describe, it } from 'mocha'
import { shallow } from 'enzyme'
import NumericTextField from '../../../js/components/report/numeric-text-field'

describe('<NumericTextField /> minValue prop', () => {
  it('should not allow non-numeric values, and default to 0', () => {
    const wrapper = shallow(<NumericTextField />)
    wrapper.find('input').simulate('change', { target: { value: 'x' } })
    wrapper.find('input').simulate('blur', {})
    expect(wrapper.state('value')).to.equal(0)
  })
  it('not allow non-numeric values; default to 10 as we specify', () => {
    const wrapper = shallow(<NumericTextField default={10} />)
    wrapper.find('input').simulate('change', { target: { value: 'x' } })
    wrapper.find('input').simulate('blur', {})
    expect(wrapper.state('value')).to.equal(10)
  })
  it('will not allow negative numbers; default to default value', () => {
    const wrapper = shallow(<NumericTextField default={10} />)
    wrapper.find('input').simulate('change', { target: { value: '-1' } })
    wrapper.find('input').simulate('blur', {})
    expect(wrapper.state('value')).to.equal(10)
  })
  it('will not allow numbers less than default (10) as we specify', () => {
    const wrapper = shallow(<NumericTextField default={10} />)
    wrapper.find('input').simulate('change', { target: { value: '5' } })
    wrapper.find('input').simulate('blur', {})
    expect(wrapper.state('value')).to.equal(5)
  })
  it('will not allow negative numbers; with default 10, and min as 0', () => {
    const wrapper = shallow(<NumericTextField default={10} min={0} />)
    wrapper.find('input').simulate('change', { target: { value: '-1' } })
    wrapper.find('input').simulate('blur', {})
    expect(wrapper.state('value')).to.equal(10)
  })
  it('will allow Zero; with default 10, and min as 0', () => {
    const wrapper = shallow(<NumericTextField default={10} min={0} />)
    wrapper.find('input').simulate('change', { target: { value: '0' } })
    wrapper.find('input').simulate('blur', {})
    expect(wrapper.state('value')).to.equal(0)
  })
  it('will allow negative values; with default 10, and min as -10', () => {
    const wrapper = shallow(<NumericTextField default={10} min={-10} />)
    wrapper.find('input').simulate('change', { target: { value: '-3' } })
    wrapper.find('input').simulate('blur', {})
    expect(wrapper.state('value')).to.equal(-3)
  })
})
