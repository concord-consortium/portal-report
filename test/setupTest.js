import { shallow, mount, configure } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import { Provider } from "react-redux";
import React from "react";

// see http://airbnb.io/enzyme/docs/installation/index.html
configure({ adapter: new Adapter() });

// A little helper that lets you quickly pass mock store.
export const shallowWithStore = (component, state) => {
  const store = { getState: () => state, subscribe: jest.fn(), dispatch: jest.fn(), default: jest.fn() };
  return shallow(
    <Provider store={store} >
      { component }
    </Provider>
  );
};

export const mountWithStore = (component, state) => {
  const store = { getState: () => state, subscribe: jest.fn(), dispatch: jest.fn(), default: jest.fn() };
  return mount(
    <Provider store={store} >
      { component }
    </Provider>
  );
};
