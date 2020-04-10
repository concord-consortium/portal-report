import React from "react";
import nock from "nock";
import { shallow } from "enzyme";
import InteractiveIframe from "../../../js/components/report/interactive-iframe";

describe("<InteractiveIframe />", () => {
  const classHash = "1234";
  const firebaseApp = "test_app";
  const firebaseJWTJson = {token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"};
  const src = "https://portal.com/fake-frame";
  const width = "200px";
  const height = "100px";

  beforeEach(() => {
    window.history.replaceState({}, "Test", "/?class=https://portal.com/classes/123");
    nock("https://portal.com/")
      .get("/classes/123")
      .reply(200, {class_hash: classHash});
    nock("https://portal.com/")
      .get(`/api/v1/jwt/firebase?firebase_app=${firebaseApp}&class_hash=${classHash}`)
      .reply(200, firebaseJWTJson);
  });

  it("should render", () => {
    const wrapper = shallow(<InteractiveIframe state={{foo: "bar"}} src={src} width={width} height={height} />);
    // .toContain used here as Travis appends an `allow="fullscreen"` attribute
    expect(wrapper.find("iframe").html()).toContain(`<iframe src="${src}" width="${width}" height="${height}" style="border:none;margin-top:0.5em"`);
  });

  it("should support handleGetFirebaseJWT", () => {
    const wrapper = shallow(<InteractiveIframe state={{foo: "bar"}} src={src} width="100px" height="100px" />);
    return wrapper
            .instance()
            .handleGetFirebaseJWT({firebase_app: firebaseApp})
            .then(json => expect(json).toEqual(firebaseJWTJson));
  });
});
