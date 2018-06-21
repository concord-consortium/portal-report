import jsdom from 'jsdom'
import chai from 'chai'
import chaiImmutable from 'chai-immutable'
import { shallow } from 'enzyme'

export const dom = new jsdom.JSDOM('<!doctype html><html><body></body></html>')

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
