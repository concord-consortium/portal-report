import {
  RECEIVE_ANSWERS,
  RECEIVE_QUESTION_FEEDBACKS,
  correctKey } from "../../js/actions/index";

describe("actions/index", () => {
  describe("correctKey", () => {
    it("Should not change keys for RECEIVE_ANSWERS", () => {
      expect(correctKey("platform_user_id", RECEIVE_ANSWERS)).toBe("platform_user_id");
    });
    it("Should change keys for RECEIVE_QUESTION_FEEDBACKS", () => {
      expect(correctKey("platform_user_id", RECEIVE_QUESTION_FEEDBACKS)).toBe("platformStudentId");
    });
  });
});
