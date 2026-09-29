import { buildAnswerLink, getAnswerLink } from "../../js/util/answer-link";

describe("getAnswerLink", () => {
  afterEach(() => {
    window.history.replaceState({}, "Test", "/");
  });

  describe("with a portal launch", () => {
    beforeEach(() => {
      window.history.replaceState({}, "Test", "/branch/master/?portal-dashboard" +
        "&offering=https://learn.example.org/api/v1/offerings/12&class=https://learn.example.org/api/v1/classes/34" +
        "&token=abc&answersSourceKey=activity-player.concord.org&firebase-app=report-service-pro");
    });

    it("links to the single-question view with the launch's parameters", () => {
      const link = getAnswerLink("authoring.example.org", "mw_interactive_29", 7);
      expect(link.startsWith(`${window.location.origin}/branch/master/?`)).toBe(true);
      const params = new URL(link).searchParams;
      expect(params.get("auth-domain")).toBe("https://learn.example.org");
      expect(params.get("firebase-app")).toBe("report-service-pro");
      expect(params.get("sourceKey")).toBe("authoring.example.org");
      expect(params.get("iframeQuestionId")).toBe("mw_interactive_29");
      expect(params.get("class")).toBe("https://learn.example.org/api/v1/classes/34");
      expect(params.get("offering")).toBe("https://learn.example.org/api/v1/offerings/12");
      expect(params.get("studentId")).toBe("7");
      expect(params.get("answersSourceKey")).toBe("activity-player.concord.org");
    });

    it("never includes the teacher's token or the dashboard flag", () => {
      const params = new URL(getAnswerLink("authoring.example.org", "mw_interactive_29", 7)).searchParams;
      expect(params.has("token")).toBe(false);
      expect(params.has("portal-dashboard")).toBe(false);
    });
  });

  describe("without a portal launch", () => {
    it("has only the source key, question and student", () => {
      window.history.replaceState({}, "Test", "/?portal-dashboard");
      const link = getAnswerLink("fake.authoring.system", "mw_interactive_29", "1");
      expect(link).toBe(`${window.location.origin}/?sourceKey=fake.authoring.system&iframeQuestionId=mw_interactive_29&studentId=1`);
    });
  });
});

describe("buildAnswerLink", () => {
  afterEach(() => {
    window.history.replaceState({}, "Test", "/");
  });

  it("keeps the launch parameters it is given and adds the question, student and auth-domain", () => {
    window.history.replaceState({}, "Test", "/branch/master/?class=https://learn.example.org/api/v1/classes/34");
    const launchParams = new URLSearchParams({ token: "abc", iframeQuestionId: "old_question", studentId: "99" });
    const params = new URL(buildAnswerLink(launchParams, "mw_interactive_29", 7)).searchParams;
    expect(params.get("token")).toBe("abc");
    expect(params.get("iframeQuestionId")).toBe("mw_interactive_29");
    expect(params.get("studentId")).toBe("7");
    expect(params.get("auth-domain")).toBe("https://learn.example.org");
  });

  it("omits auth-domain without a portal launch", () => {
    const params = new URL(buildAnswerLink(new URLSearchParams(), "mw_interactive_29", 7)).searchParams;
    expect(params.has("auth-domain")).toBe(false);
  });
});
