import {getLoggingUserName} from "../../js/reducers/report-reducer";

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
});
