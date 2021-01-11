import React from "react";
import { mount } from "enzyme";
import DataFetchError from "../../../js/components/report/data-fetch-error";

describe("<DataFetchError />", () => {
  let dataFetchError;

  describe("when the error has a plain text body", () => {
    beforeEach(() => {
      dataFetchError = mount(<DataFetchError
        error={{title: "fake title", body: "fake error body"}}
      />);
    });

    it("should render the text", () => {
      expect(dataFetchError.text()).toEqual(expect.stringContaining("fake error body"));
    });
  });

  describe("when the error has a url and no body", () => {
    beforeEach(() => {
      dataFetchError = mount(<DataFetchError
        error={{title: "fake title", url: "http://example.com"}}
      />);
    });

    it("should render the url", () => {
      expect(dataFetchError.text()).toEqual(expect.stringContaining("URL: http://example.com"));
    });
  });

  // <div>URL: {error.url}</div>
  // <div>Status: {error.status}</div>
  // <div>Status text: {error.statusText}</div>

  // The data fetch error also supports an error which is the response from a fetch
  // in this case the error.body is a ReadableStream. This is tested by
  // cypress/integration/api-error.spec.js
});
