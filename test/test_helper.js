import jsdom from 'jsdom'
import chai from 'chai'
import chaiImmutable from 'chai-immutable'
import { shallow, configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-15'

// see http://airbnb.io/enzyme/docs/installation/index.html
configure({ adapter: new Adapter() })

const simpleDomOptions = {
  url: 'https://example.org/',
  referrer: 'https://example.com/',
  contentType: 'text/html',
  userAgent: 'hal/9000',
  includeNodeLocations: true,
  storageQuota: 10000000
}
export const dom = new jsdom.JSDOM('<!doctype html><html><body></body></html>', simpleDomOptions)

global.window = dom.window
global.document = dom.window.document

Object.keys(window).forEach((key) => {
  if (!(key in global)) {
    global[key] = window[key]
  }
})

chai.use(chaiImmutable)

// A little helper that lets you quickly pass mock store.
export const shallowWithStore = (component, store) => {
  const context = {
    store
  }
  return shallow(component, { context })
}
