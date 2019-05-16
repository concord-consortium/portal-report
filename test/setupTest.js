import { shallow, configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'

// see http://airbnb.io/enzyme/docs/installation/index.html
configure({ adapter: new Adapter() })

// A little helper that lets you quickly pass mock store.
export const shallowWithStore = (component, store) => {
  const context = {
    store
  }
  return shallow(component, { context })
}
