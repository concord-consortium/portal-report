import { fromJS } from "immutable";
import {
  getSortedStudents,
  getStudentProgress,
  getStudentAverageProgress,
  getSelectedQuestion
} from "../../js/selectors/dashboard-selectors";

import { SORT_BY_NAME, SORT_BY_MOST_PROGRESS, SORT_BY_LEAST_PROGRESS } from "../../js/actions/dashboard";

describe("dashboard selectors", () => {
  const s1 = { id: 1, firstName: "Y", lastName: "aA" };
  const s2 = { id: 2, firstName: "x", lastName: "AA" };
  const s3 = { id: 3, firstName: "Z", lastName: "a" };

  const state = ({ sortBy = SORT_BY_NAME }) => fromJS({
    report: {
      students: { 1: s1, 2: s2, 3: s3 },
      activities: {
        1: { children: [ 1 ] },
        2: { children: [ 2 ] }
      },
      sections: {
        1: { children: [ 1 ] },
        2: { children: [ 2 ] }
      },
      pages: {
        1: { children: [ "open_response-1" ] },
        2: { children: [ "open_response-2", "image_question-1" ] }
      },
      questions: {
        "open_response-1": { id: 1, type: "open_response"  }, // activity 1
        "open_response-2": { id: 2, type: "open_response" }, // activity 2
        "image_question-1": { id: 1, type: "image_question" } // activity 2
      },
      answers: {
        A1: { studentId: 1, type: "SomeAnswer", submitted: true },
        A2: { studentId: 2, type: "SomeAnswer", submitted: true },
        A3: { studentId: 1, type: "SomeAnswer", submitted: false },
        A4: { studentId: 2, type: "SomeAnswer", submitted: true },
        A5: { studentId: 1, type: "SomeAnswer", submitted: true },
        A6: { studentId: 2, type: "NoAnswer" }
      }
    },
    dashboard: {
      sortBy
    }
  });

  // TODO fix these tests when we start supporting answers using new data format
  xdescribe("getStudentProgress", () => {
    it("should return hash with student progress", () => {
      expect(getStudentProgress(state({})).toJS()).toEqual({
        1: {
          1: 1, // activity 1
          2: 0.5 // activity 2 - only one submitted answer
        },
        2: {
          1: 1, // activity 1
          2: 0.5 // activity 2 - one submitted answer
        },
        3: { // this student hasn't started any activity, no answer objects
          1: 0,
          2: 0
        }
      });
    });
  });

  // TODO fix these tests when we start supporting answers using new data format
  xdescribe("getStudentAverageProgress", () => {
    it("should return hash with student total progress", () => {
      expect(getStudentAverageProgress(state({})).toJS()).toEqual({
        1: 0.75,
        2: 0.75,
        3: 0
      });
    });
  });

  describe("getSortedStudents", () => {
    describe("when sorting by name", () => {
      it("should return sorted list of students", () => {
        expect(getSortedStudents(state({})).toJS()).toEqual( // Students sorted by name (last name first, ignoring capitalization)
        [ s3, s2, s1 ]);
      });
    });

    // TODO fix these tests when we start supporting answers using new data format
    xdescribe("when sorting by most progress", () => {
      it("should return sorted list of students", () => {
        expect(getSortedStudents(state({sortBy: SORT_BY_MOST_PROGRESS})).toJS()).toEqual(// Students sorted by most progress (ties broken alphabetically)
        [ s2, s1, s3 ]);
      });
    });

    // TODO fix these tests when we start supporting answers using new data format
    xdescribe("when sorting by least progress", () => {
      it("should return sorted list of students", () => {
        expect(getSortedStudents(state({sortBy: SORT_BY_LEAST_PROGRESS})).toJS()).toEqual(// Students sorted by least progress (ties broken alphabetically)
        [ s3, s2, s1 ]);
      });
    });

    describe("getSelectedQuestion", () => {
      const state = ({ selectedQuestion = null }) => fromJS({
        report: {
          questions: {
            "open_response-1": { id: 1, type: "open_response", prompt: "prompt1" },
            "open_response-2": { id: 2, type: "open_response", prompt: "prompt2" }
          },
          activities: {}
        },
        dashboard: {
          selectedQuestion: selectedQuestion
        }
      });

      describe("When no question is selected", () => {
        it("should return an empty map", () => {
          expect(getSelectedQuestion(state({selectedQuestion: null}))).toBe(null);
        });
      });

      describe("When Q1 is selected", () => {
        it("Should return the prompt for the first question ...", () => {
          const s = state({selectedQuestion: "open_response-1"});
          const question = getSelectedQuestion(s).toJS();
          expect(question.prompt).toBe("prompt1");
        });
      });

      describe("When Q2 is selected", () => {
        it("Should return the prompt for the second question ...", () => {
          const s = state({selectedQuestion: "open_response-2"});
          const question = getSelectedQuestion(s).toJS();
          expect(question.prompt).toBe("prompt2");
        });
      });
    });
  });
});
