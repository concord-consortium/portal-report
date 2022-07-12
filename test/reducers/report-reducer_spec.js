import { getReportItemAnswer, registerReportItem } from "../../js/actions";
import report, {ReportState, getLoggingUserName} from "../../js/reducers/report-reducer";
import iframePhone from "iframe-phone";
import { fromJS } from "immutable";

describe("report reducer", () => {

  describe("helper functions", () => {

    describe("getLoggingUserName", () => {

      it("should return unknowns when data is empty", () => {
        expect(getLoggingUserName({platformUserId: "", platformId: ""})).toBe("unknown@unknown");
      });

      it("should return unknown for domain when the platformId is malformed", () => {
        expect(getLoggingUserName({platformUserId: "100", platformId: "foo"})).toBe("100@unknown");
      });

      it("should return the domain from the platformId", () => {
        expect(getLoggingUserName({platformUserId: "100", platformId: "http://example.com"})).toBe("100@example.com");
        expect(getLoggingUserName({platformUserId: "100", platformId: "https://example.com"})).toBe("100@example.com");
        expect(getLoggingUserName({platformUserId: "100", platformId: "https://example.com/"})).toBe("100@example.com");
        expect(getLoggingUserName({platformUserId: "100", platformId: "https://example.com/foo"})).toBe("100@example.com");
        expect(getLoggingUserName({platformUserId: "100", platformId: "https://example.com/foo/bar"})).toBe("100@example.com");
        expect(getLoggingUserName({platformUserId: "100", platformId: "https://example.com/foo//bar"})).toBe("100@example.com");
      });
    });
  });

  describe("getReportItemAnswer", () => {
    let state;
    const questionId = "123";
    const platformUserId = "user1";
    const phone = new iframePhone.ParentEndpoint();

    beforeEach(() => {
      jest.clearAllMocks();

      state = new ReportState();
      state = state.set("answers", fromJS([{ questionId, platformUserId, reportState: '{ "authoredState": "{}", "interactiveState": "{}" }' }]));
    });

    describe("when there's no report item metadata or it's empty", () => {
      beforeEach(() => {
        state = report(state, registerReportItem(questionId, phone));
      });

      it("skips `getReportItemAnswer` iframe phone requests when the itemsType is `compactAnswer`", () => {
        report(state, getReportItemAnswer(questionId, platformUserId, "compactAnswer"));
        expect(phone.post).not.toHaveBeenCalled();
      });

      it("sends `getReportItemAnswer` iframe phone request when the itemsType is `fullAnswer`", () => {
        report(state, getReportItemAnswer(questionId, platformUserId, "fullAnswer"));
        expect(phone.post).toHaveBeenCalledTimes(1);
        expect(phone.post).toHaveBeenCalledWith("getReportItemAnswer", expect.objectContaining({
          platformUserId, authoredState: {}, interactiveState: {}, itemsType: "fullAnswer"
        }));
      });

      it("sends `getReportItemAnswer` iframe phone request when the itemsType is not provided (as it defaults to `fullAnswer`)", () => {
        report(state, getReportItemAnswer(questionId, platformUserId));
        expect(phone.post).toHaveBeenCalledTimes(1);
        expect(phone.post).toHaveBeenCalledWith("getReportItemAnswer", expect.objectContaining({
          platformUserId, authoredState: {}, interactiveState: {}, itemsType: "fullAnswer"
        }));
      });
    });

    describe("when there's report item metadata with `compactAnswerReportItemsAvailable` equal to true", () => {
      beforeEach(() => {
        state = report(state, registerReportItem(questionId, phone, { compactAnswerReportItemsAvailable: true }));
      });

      it("sends `getReportItemAnswer` iframe phone requests when the itemsType is `compactAnswer`", () => {
        report(state, getReportItemAnswer(questionId, platformUserId, "compactAnswer"));
        expect(phone.post).toHaveBeenCalledTimes(1);

        expect(phone.post).toHaveBeenCalledWith("getReportItemAnswer", expect.objectContaining({
          platformUserId, authoredState: {}, interactiveState: {}, itemsType: "compactAnswer"
        }));
      });

      it("sends `getReportItemAnswer` iframe phone request when the itemsType is `fullAnswer`", () => {
        report(state, getReportItemAnswer(questionId, platformUserId, "fullAnswer"));
        expect(phone.post).toHaveBeenCalledTimes(1);
        expect(phone.post).toHaveBeenCalledWith("getReportItemAnswer", expect.objectContaining({
          platformUserId, authoredState: {}, interactiveState: {}, itemsType: "fullAnswer"
        }));
      });
    });

  });
});
