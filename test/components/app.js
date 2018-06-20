import React from 'react'
import { expect } from 'chai'
import { describe, it, beforeEach } from 'mocha'
import { shallow } from 'enzyme'
import App from '../../js/components/app'
import { dom } from '../test_helper'

describe('<App />', () => {
  beforeEach(() => {
    dom.reconfigure({ url: 'https://example.com/' })
  })

  describe('when dashboard=true URL param is not present', () => {
    it('renders ReportAPP component', () => {
      const wrapper = shallow(<App />)
      expect(wrapper.first().name()).to.equal('Connect(ReportApp)')
    })
  })
  describe('when dashboard=true URL param is present', () => {
    beforeEach(() => {
      dom.reconfigure({ url: 'https://example.com/?dashboard=true' })
    })

    it('renders DashboardApp component', () => {
      const wrapper = shallow(<App />)
      expect(wrapper.first().name()).to.equal('Connect(DashboardApp)')
    })
  })
})
