import queryString from "query-string";

describe("location test", () => {

  const oldWindowLocation = window.location;

  function getWindowHref() {
    const calls = window.location.assign.mock.calls;
    return calls[calls.length - 1][0];
  }

  beforeAll(() => {
    delete window.location;

    window.location = Object.defineProperties(
      {},
      {
        ...Object.getOwnPropertyDescriptors(oldWindowLocation),
        assign: {
          configurable: true,
          value: jest.fn((url) => { assignedUrl = url }),
        },
      }
    )
    // TODO override href set so it throws an error if someone tries to call it
    // it is possible that will happen any way
  });

  beforeEach(() => {
    window.location.assign.mockReset()
  });

  afterAll(() => {
    // restore `window.location` to the `jsdom` `Location` object
    window.location = oldWindowLocation
  });

  it("calls assign with expected url", () => {
    window.location.assign('https://www.benmvp.com/minishops/')

    expect(window.location.assign).toHaveBeenCalledTimes(1)
    expect(window.location.assign).toHaveBeenCalledWith(
      'https://www.benmvp.com/minishops/',
    )
  });

  it("calls asign and then we can access the assigned value", () => {
    window.location.assign('https://www.benmvp.com/minishops/?param=value');

    expect(getWindowHref()).toEqual("https://www.benmvp.com/minishops/?param=value");
  });

  it("calls asign and then we can access the parameters", () => {
    window.location.assign('https://www.benmvp.com/minishops/?param=value');
    const urlParts = queryString.parseUrl(getWindowHref(), {parseFragmentIdentifier: true});
    expect(urlParts.query.param).toEqual("value");
  });

  it("calls asign and then we can access the hash parameters", () => {
    window.location.assign('https://www.benmvp.com/minishops/?param=value#hParam=value2');
    const urlParts = queryString.parseUrl(getWindowHref(), {parseFragmentIdentifier: true});
    const hashParams = queryString.parse(urlParts.fragmentIdentifier);
    expect(hashParams.hParam).toEqual("value2");
  });

});
