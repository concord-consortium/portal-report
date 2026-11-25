import { Map } from "immutable";
import { getFormattedStudentName } from "../../js/util/student-utils";

describe("student utils", () => {
  const student = Map({ firstName: "John", lastName: "Jenkins", name: "Student 1" });
  const learnerModeStudent = Map({ firstName: "Test", lastName: "Teacher", name: "Student 2 (LM)",
    isTeacherPreviewStudent: true });

  describe("getFormattedStudentName", () => {
    it("gives Last, First when names are shown, with (LM) only for a learner mode account", () => {
      expect(getFormattedStudentName(false, student)).toBe("Jenkins, John");
      expect(getFormattedStudentName(false, learnerModeStudent)).toBe("Teacher, Test (LM)");
    });

    it("gives the anonymized name as it is when anonymous", () => {
      expect(getFormattedStudentName(true, student)).toBe("Student 1");
      expect(getFormattedStudentName(true, learnerModeStudent)).toBe("Student 2 (LM)");
    });
  });
});
