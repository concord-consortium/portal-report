import { expect } from 'chai'
import { beforeEach, afterEach, describe, it } from 'mocha'
import { dom } from './test_helper'
import nock from 'nock'
import { fetchReportData } from '../js/api'

describe('api helper', () => {
  afterEach(() => {
    dom.reconfigure({ url: 'https://example.com/' })
    nock.cleanAll()
  })

  describe('fetchReportData', () => {
    const okResponse = { message: 'OK' }

    beforeEach(() => {
      nock('https://portal.com/')
        .get('/offerings/123').reply(200, { weDontWantToReceiveThisOne: 123 })
        .get('/reports/123').reply(200, okResponse)
    })

    describe('when reportUrl URL param is present', () => {
      beforeEach(() => {
        dom.reconfigure({ url: 'https://example.com/?reportUrl=https://portal.com/reports/123&offering=https://portal.com/offerings/123' })
      })
      it('should use it to download report data', async () => {
        const resp = await fetchReportData()
        expect(resp).to.eql(okResponse)
      })
    })

    describe('when reportUrl URL param is not available, but there is offering URL', () => {
      beforeEach(() => {
        dom.reconfigure({ url: 'https://example.com/?offering=https://portal.com/offerings/123' })
      })
      it('should use offering URL to generate report API URL and use it to download report data', async () => {
        const resp = await fetchReportData()
        expect(resp).to.eql(okResponse)
      })
    })
  })
})
