import React from 'react'
import { shallow } from 'enzyme'
import NumericTextField from '../../../js/components/report/numeric-text-field'

describe('<NumericTextField /> minValue prop', () => {

  describe('default behavior with no configuration', () => {
    it('should not allow non-numeric values, and default to 0', () => {
      const wrapper = shallow(<NumericTextField />)
      wrapper.find('input').simulate('change', { target: { value: 'x' } })
      wrapper.find('input').simulate('blur', {})
      expect(wrapper.state('value')).toBe(0)
    })
    it('will allow values greater than 0', () => {
      const wrapper = shallow(<NumericTextField />)
      wrapper.find('input').simulate('change', { target: { value: '5' } })
      wrapper.find('input').simulate('blur', {})
      expect(wrapper.state('value')).toBe(5)
    })
    it('will allow an in-range decimal value. Truncates to integer', () => {
      const wrapper = shallow(<NumericTextField />)
      wrapper.find('input').simulate('change', { target: { value: '2.6' } })
      wrapper.find('input').simulate('blur', {})
      expect(wrapper.state('value')).toBe(2)
    })
  })

  describe('When default value is set to 10', () => {
    it('wont allow non-numeric values. Revert to 10', () => {
      const wrapper = shallow(<NumericTextField default={10} />)
      wrapper.find('input').simulate('change', { target: { value: 'x' } })
      wrapper.find('input').simulate('blur', {})
      expect(wrapper.state('value')).toBe(10)
    })
    it('wont allow negative numbers. Revert to 10', () => {
      const wrapper = shallow(<NumericTextField default={10} />)
      wrapper.find('input').simulate('change', { target: { value: '-1' } })
      wrapper.find('input').simulate('blur', {})
      expect(wrapper.state('value')).toBe(10)
    })

    describe('When min value is set to 0', () => {
      it('will allow 0.', () => {
        const wrapper = shallow(<NumericTextField default={10} min={0} />)
        wrapper.find('input').simulate('change', { target: { value: '0' } })
        wrapper.find('input').simulate('blur', {})
        expect(wrapper.state('value')).toBe(0)
      })
      it('wont allow negative numbers; will revert to 10', () => {
        const wrapper = shallow(<NumericTextField default={10} min={0} />)
        wrapper.find('input').simulate('change', { target: { value: '-1' } })
        wrapper.find('input').simulate('blur', {})
        expect(wrapper.state('value')).toBe(10)
      })
    })

    describe('When min value is set to -10', () => {
      it('will allow negative values > -10', () => {
        const wrapper = shallow(<NumericTextField default={10} min={-10} />)
        wrapper.find('input').simulate('change', { target: { value: '-3' } })
        wrapper.find('input').simulate('blur', {})
        expect(wrapper.state('value')).toBe(-3)
      })
    })

    describe('When min value is set to 1', () => {
      it('wont allow 0. Will revert to 10', () => {
        const wrapper = shallow(<NumericTextField default={10} min={1} />)
        wrapper.find('input').simulate('change', { target: { value: '0' } })
        wrapper.find('input').simulate('blur', {})
        expect(wrapper.state('value')).toBe(10)
      })
    })
  })
})
