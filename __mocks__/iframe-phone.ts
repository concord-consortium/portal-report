const parentInstances: ParentEndpoint[] = [];

class ParentEndpoint {
  constructor(iframe: HTMLIFrameElement, phoneAnsweredCallback: () => void) {
    setTimeout(phoneAnsweredCallback, 1);
    parentInstances.push(this);
  }

  post = jest.fn();
  disconnect = jest.fn();
  addListener = jest.fn((type: string, handler: any) => this._handlers[type] = handler);

  // Mock helpers
  _handlers: {[key: string]: any} = {};
  _trigger(type: string, data: any) {
    this._handlers[type](data);
  }
}

export default {
  ParentEndpoint,
  // Mock helpers.
  _resetMock: () => {
    parentInstances.length = 0;
  },
  _parentInstances: parentInstances
};
