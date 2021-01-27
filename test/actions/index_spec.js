import {
  RECEIVE_ANSWERS,
  RECEIVE_QUESTION_FEEDBACKS,
  correctKey,
  trackEvent,
  enableLogging } from "../../js/actions/index";

describe("actions/index", () => {
  describe("correctKey", () => {
    it("Should not change keys for RECEIVE_ANSWERS", () => {
      expect(correctKey("platform_user_id", RECEIVE_ANSWERS)).toBe("platform_user_id");
    });
    it("Should change keys for RECEIVE_QUESTION_FEEDBACKS", () => {
      expect(correctKey("platform_user_id", RECEIVE_QUESTION_FEEDBACKS)).toBe("platformStudentId");
    });
  });

  describe("trackEvent", () => {
    let gtag;
    let dispatch;
    let getState;
    let savedHTMLHttpRequest;
    let xmlHTTPSend;

    beforeAll(() => {
      savedHTMLHttpRequest = window.XMLHttpRequest;
    });
    afterAll(() => {
      window.XMLHttpRequest = savedHTMLHttpRequest;
    });

    beforeEach(() => {
      window.gtag = gtag = jest.fn()
      dispatch = jest.fn();
      getState = () => ({
        getIn: () => "test"
      });

      xmlHTTPSend = jest.fn()
      window.XMLHttpRequest = jest.fn().mockImplementation(() => ({
        open: jest.fn(),
        setRequestHeader: jest.fn(),
        send: xmlHTTPSend
      }));
    })

    it("calls gtag", () => {
      trackEvent("Report", "action 1")(dispatch, getState);
      expect(gtag).toHaveBeenCalledWith("event", "action 1", {"event_category": "Report", "event_label": "Class ID: test"});
    });

    describe("when logging is disabled", () => {

      it("does not log events", () => {
        trackEvent("Report", "action 1")(dispatch, getState);
        expect(xmlHTTPSend).not.toHaveBeenCalled();
      });
    });

    describe("when logging is enabled", () => {
      beforeAll(() => {
        enableLogging(true);
      });
      afterAll(() => {
        enableLogging(false);
      });

      it("logs events", () => {
        trackEvent("Report", "action 1")(dispatch, getState);
        expect(xmlHTTPSend).toHaveBeenCalled();
      });
    });
  });
});
