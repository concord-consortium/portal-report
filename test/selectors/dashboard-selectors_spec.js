import { fromJS } from "immutable";
import {
  getSortedStudents,
  getStudentProgress,
  getStudentAverageProgress,
  getSelectedQuestion
} from "../../js/selectors/dashboard-selectors";

import { SORT_BY_NAME, SORT_BY_MOST_PROGRESS, SORT_BY_LEAST_PROGRESS } from "../../js/actions/dashboard";

describe("dashboard selectors", () => {
  const s1 = { id: "1@email.com", firstName: "Y", lastName: "aA" };
  const s2 = { id: "2@email.com", firstName: "x", lastName: "AA" };
  const s3 = { id: "3@email.com", firstName: "Z", lastName: "a" };

  const state = ({ sortBy = SORT_BY_NAME }) => fromJS({
    report: {
      students: { "1@email.com": s1, "2@email.com": s2, "3@email.com": s3 },
      activities: {
        a1: { children: [ "s1" ] },
        a2: { children: [ "s2" ] }
      },
      sections: {
        s1: { children: [ "p1" ] },
        s2: { children: [ "p2" ] }
      },
      pages: {
        p1: { children: [ "open_response-1" ] },
        p2: { children: [ "open_response-2", "image_question-1" ] }
      },
      questions: {
        "open_response-1": { id: "open_response-1", type: "open_response", required: true  }, // activity 1
        "open_response-2": { id: "open_response-2", type: "open_response", required: true }, // activity 2
        "image_question-1": { id: "image_question-1", type: "image_question" } // activity 2
      },
      answers: {
        ans1: { id: "ans1", questionId: "open_response-1",  userEmail: "1@email.com", type: "SomeAnswer", submitted: true },
        ans2: { id: "ans2", questionId: "open_response-1", userEmail: "2@email.com", type: "SomeAnswer", submitted: true },
        ans3: { id: "ans3", questionId: "open_response-2", userEmail: "1@email.com", type: "SomeAnswer", submitted: false },
        ans4: { id: "ans4", questionId: "open_response-2", userEmail: "2@email.com", type: "SomeAnswer", submitted: true },
        ans5: { id: "ans5", questionId: "image_question-1", userEmail: "1@email.com", type: "SomeAnswer" }
      }
    },
    dashboard: {
      sortBy
    }
  });

  describe("getStudentProgress", () => {
    it("should return hash with student progress", () => {
      expect(getStudentProgress(state({})).toJS()).toEqual({
        "1@email.com": {
          a1: 1, // activity 1
          a2: 0.5 // activity 2 - only one submitted answer
        },
        "2@email.com": {
          a1: 1, // activity 1
          a2: 0.5 // activity 2 - one submitted answer
        },
        "3@email.com": { // this student hasn't started any activity, no answer objects
          a1: 0,
          a2: 0
        }
      });
    });
  });

  describe("getStudentAverageProgress", () => {
    it("should return hash with student total progress", () => {
      expect(getStudentAverageProgress(state({})).toJS()).toEqual({
        "1@email.com": 0.75,
        "2@email.com": 0.75,
        "3@email.com": 0
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
    describe("when sorting by most progress", () => {
      it("should return sorted list of students", () => {
        expect(getSortedStudents(state({sortBy: SORT_BY_MOST_PROGRESS})).toJS()).toEqual(// Students sorted by most progress (ties broken alphabetically)
        [ s2, s1, s3 ]);
      });
    });

    // TODO fix these tests when we start supporting answers using new data format
    describe("when sorting by least progress", () => {
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
