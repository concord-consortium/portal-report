import {
  RECEIVE_ANSWERS,
  RECEIVE_INTERACTIVE_STATE_HISTORIES,
  RECEIVE_QUESTION_FEEDBACKS,
  correctKey,
  trackEvent,
  enableLogging,
  setLoggingVars,
  setExtraEventLoggingParameters } from "../../js/actions/index";

describe("actions/index", () => {
  const classInfo = { id: 1 };

  describe("correctKey", () => {
    it("Should not change keys for RECEIVE_ANSWERS", () => {
      expect(correctKey("platform_user_id", RECEIVE_ANSWERS)).toBe("platform_user_id");
    });
    it("Should not change keys for RECEIVE_INTERACTIVE_STATE_HISTORIES", () => {
      expect(correctKey("platform_user_id", RECEIVE_INTERACTIVE_STATE_HISTORIES)).toBe("platform_user_id");
    });
    it("Should change keys for RECEIVE_QUESTION_FEEDBACKS", () => {
      expect(correctKey("platform_user_id", RECEIVE_QUESTION_FEEDBACKS)).toBe("platformStudentId");
    });
  });

  describe("setLoggingVars", () => {

    it("handles activities", () => {
      expect(setLoggingVars("http://example.com/activities/100", {classInfo}).loggingActivity).toBe("activity: 100");
    });

    it("handles sequences", () => {
      expect(setLoggingVars("http://example.com/sequences/200", {classInfo}).loggingActivity).toBe("sequence: 200");
    });

    it("handles contextId", () => {
      expect(setLoggingVars("http://example.com/activities/1", {classInfo, contextId: "12345"}).loggingContextId).toBe("12345");
    });

    it("handles classId", () => {
      expect(setLoggingVars("http://example.com/activities/1", {classInfo}).loggingClassId).toBe(1);
    });

    it("handles production portal logging", () => {
      const prodLogManagerUrl = "https://logger.concord.org/logs";
      expect(setLoggingVars("http://example.com/activities/1", {classInfo, platformId: "https://learn.concord.org"}).logManagerUrl).toBe(prodLogManagerUrl);
      expect(setLoggingVars("http://example.com/activities/1", {classInfo, platformId: "https://itsi.portal.concord.org"}).logManagerUrl).toBe(prodLogManagerUrl);
      expect(setLoggingVars("http://example.com/activities/1", {classInfo, platformId: "https://ngsa.portal.concord.org"}).logManagerUrl).toBe(prodLogManagerUrl);
    });

    it("handles staging/development portal logging", () => {
      const stagingLogManagerUrl = "https://logger.concordqa.org/logs";
      expect(setLoggingVars("http://example.com/activities/1", {classInfo, platformId: "https://learn.staging.concord.org"}).logManagerUrl).toBe(stagingLogManagerUrl);
      expect(setLoggingVars("http://example.com/activities/1", {classInfo, platformId: "https://app.rigse.docker"}).logManagerUrl).toBe(stagingLogManagerUrl);
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
      window.gtag = gtag = jest.fn();
      dispatch = jest.fn();
      getState = () => ({
        getIn: () => "test"
      });

      xmlHTTPSend = jest.fn();
      window.XMLHttpRequest = jest.fn().mockImplementation(() => ({
        open: jest.fn(),
        setRequestHeader: jest.fn(),
        send: xmlHTTPSend
      }));
    });

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
      beforeEach(() => {
        jest.clearAllMocks();
        enableLogging(true);
      });
      afterAll(() => {
        enableLogging(false);
      });

      it("logs events", () => {
        trackEvent("Report", "action 1")(dispatch, getState);
        expect(xmlHTTPSend).toHaveBeenCalledWith(expect.stringContaining("\"username\":\"test\",\"application\":\"portal-report\",\"activity\":\"activity: 1\",\"event\":\"action 1\""));
      });

      describe("for activities", () => {
        beforeEach(() => {
          setLoggingVars("http://example.com/activities/1", {classInfo, contextId: "12345"});
          setExtraEventLoggingParameters({
            className: "Test Class",
            sequenceName: "Should Not Appear In Logs for Activities",
            currentActivityName: "Test Activity"
          });
        });

        it("logs logging vars and extra parameters", () => {
          trackEvent("Report", "action 1")(dispatch, getState);
          expect(xmlHTTPSend).toHaveBeenCalledWith(expect.stringContaining("\"parameters\":{\"contextId\":\"12345\",\"classId\":1,\"className\":\"Test Class\",\"activityName\":\"Test Activity\"}"));
        });
      });

      describe("for sequences", () => {
        beforeEach(() => {
          setLoggingVars("http://example.com/sequences/1", {classInfo, contextId: "12345"});
          setExtraEventLoggingParameters({
            className: "Test Class",
            sequenceName: "Test Sequence",
            currentActivityName: "Test Activity"
          });
        });

        it("logs logging vars and extra parameters", () => {
          trackEvent("Report", "action 1")(dispatch, getState);
          expect(xmlHTTPSend).toHaveBeenCalledWith(expect.stringContaining("\"parameters\":{\"contextId\":\"12345\",\"classId\":1,\"className\":\"Test Class\",\"sequenceName\":\"Test Sequence\",\"activityName\":\"Test Activity\"}"));
        });
      });
    });
  });
});
