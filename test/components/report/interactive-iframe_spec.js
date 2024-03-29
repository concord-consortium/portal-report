import React from "react";
import nock from "nock";
import { shallow } from "enzyme";
import InteractiveIframe from "../../../js/components/report/interactive-iframe";
import iframePhone from "iframe-phone";
import { Map } from "immutable";

const mockAttachmentUrlResponse = { url: "test_attachment_url" };
const mockHandleGetAttachmentUrl = jest.fn(() => Promise.resolve(mockAttachmentUrlResponse));
jest.mock("@concord-consortium/interactive-api-host", () => ({
  handleGetAttachmentUrl: (...args) => mockHandleGetAttachmentUrl(...args)
}));

describe("<InteractiveIframe />", () => {
  const classHash = "1234";
  const firebaseApp = "test_app";
  const firebaseJWTJson = {token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"};
  const src = "https://portal.com/fake-frame";
  const width = "200px";
  const height = "100px";
  const answerMap = new Map({});

  beforeEach(() => {
    window.history.replaceState({}, "Test", "/?token=abcde&class=https://portal.com/classes/123");
    nock("https://portal.com/")
      .get("/classes/123")
      .reply(200, {class_hash: classHash});
    nock("https://portal.com/")
      .get(`/api/v1/jwt/firebase?firebase_app=${firebaseApp}&class_hash=${classHash}`)
      .reply(200, firebaseJWTJson);
  });

  beforeEach(() => {
    iframePhone._resetMock();
  });

  it("should render", () => {
    const wrapper = shallow(<InteractiveIframe state={{foo: "bar"}} src={src} width={width} height={height} />);
    // .toContain used here as Travis appends an `allow="fullscreen"` attribute
    expect(wrapper.find("iframe").html()).toContain(`<iframe src="${src}" width="${width}" height="${height}" style="border:none;margin-top:0.5em"`);
  });

  it("should support getFirebaseJWT API", () => {
    const wrapper = shallow(<InteractiveIframe state={{foo: "bar"}} src={src} width="100px" height="100px" />);
    wrapper
      .instance()
      .handleGetFirebaseJWT({firebase_app: firebaseApp})
      .then(json => {
        expect(json).toEqual(firebaseJWTJson);
        // iframe-phone mock is defined in __mocks__/iframe-phone.ts
        expect(iframePhone._parentInstances.length).toEqual(1);
        const phone = iframePhone._parentInstances[0];
        expect(phone.post).toHaveBeenCalledWith("firebaseJWT", json);
      });
  });

  it("should support getAttachmentUrl API", () => {
    const wrapper = shallow(<InteractiveIframe state={{foo: "bar"}} src={src} answer={answerMap} width="100px" height="100px" />);
    wrapper
      .instance()
      .handleGetAttachmentUrl({ fakeRequest: true })
      .then(json => {
        expect(mockHandleGetAttachmentUrl).toHaveBeenCalled();
        expect(json).toEqual(mockAttachmentUrlResponse);
        // iframe-phone mock is defined in __mocks__/iframe-phone.ts
        expect(iframePhone._parentInstances.length).toEqual(1);
        const phone = iframePhone._parentInstances[0];
        expect(phone.post).toHaveBeenCalledWith("attachmentUrl", json);
      });
  });

  it("should handle Interactive API height message", () => {
    const wrapper = shallow(<InteractiveIframe state={{foo: "bar"}} src={src} width="100px" height="100px" />);
    expect(wrapper.find("iframe").prop("height")).toEqual("100px");
    // iframe-phone mock is defined in __mocks__/iframe-phone.ts
    expect(iframePhone._parentInstances.length).toEqual(1);
    const phone = iframePhone._parentInstances[0];
    phone._trigger("height", 321);
    expect(wrapper.find("iframe").prop("height")).toEqual(321);
  });


  it("should try to parse interactiveState in the provided state", (done) => {
    const state = {
      mode: "report",
      interactiveState: '{ "foo": "bar" }'
    };
    shallow(<InteractiveIframe state={state} src={src} />);

    setTimeout(() => {
      // iframe-phone mock is defined in __mocks__/iframe-phone.ts
      expect(iframePhone._parentInstances.length).toEqual(1);
      const phone = iframePhone._parentInstances[0];
      const stateWithParsedInteractiveState = {
        mode: "report",
        interactiveState: { foo: "bar" }
      };
      expect(phone.post).toHaveBeenCalledWith("initInteractive", stateWithParsedInteractiveState);
      done();
    }, 10); // iframe-mock calls phoneAnsweredCallback after 1ms
  });
});
