import {
  getStudentFeedbacks,
  getAutoscores,
  getRubricScores
} from "../../js/selectors/activity-feedback-selectors";

describe("activity-feedback-selectors", () => {
  const students = [
    {
      lastName: "Paessel",
      firstName: "Noah",
      id: 1,
      realName: "Noah Paessel"
    },
    {
      lastName: "Ada",
      firstName: "Noah",
      id: 2,
      realName: "Ada Paessel"
    }
  ];

  const activity = {
    id: 1,
    activityFeedback: ["1-1", "1-2"],
    scoreType: "manual"
  };

  const activityFeedbacks = {
    "1-1": {
      key: "1-1",
      platformStudentId: 1,
      learnerId: 201,
      feedback: "good",
      hasBeenReviewed: true,
      rubricFeedback: {
        C1: {
          description: "Not meeting expected goals.",
          id: "R1",
          label: "Beginning",
          score: 1
        },
        C2: {
          description: "Not meeting expected goals.",
          id: "R1",
          label: "Beginning",
          score: 1
        }
      },
      score: 1

  },
    "1-2": {
      key: "1-2",
      platformStudentId: 2,
      learnerId: 202,
      feedback: "better",
      hasBeenReviewed: true,
      rubricFeedback: {
        C1: {
          description: "better",
          id: "R1",
          label: "better",
          score: 2
        },
        C2: {
          description: "better",
          id: "R1",
          label: "better",
          score: 2
        }
      },
      score: 2
    }
  };

  const progress = {
    "1": {
      "1": 0.5
    },
    "2": {
      "1": 0.5
    }
  };

  describe("getStudentFeedbacks", () => {
    it("should be a function", () => {
      expect(typeof getStudentFeedbacks).toBe("function");
    });

    describe("with two complete answers", () => {
      let studentFeedbacks = null;
      beforeEach(() => {
        studentFeedbacks = getStudentFeedbacks(
          activity,
          students,
          activityFeedbacks,
          progress
        );
      });
      it("should have two scores", () => {
        expect(studentFeedbacks.scores).toEqual(expect.arrayContaining([1, 2]));
      });
      describe("with one answer not reviewed", () => {
        beforeEach(() => {
          studentFeedbacks = getStudentFeedbacks(
            activity,
            students,
            activityFeedbacks.setIn(["1-2", "hasBeenReviewed"], false),
            progress
          );
        });
        it("should have one score", () => {
          expect(studentFeedbacks.scores).toEqual(expect.arrayContaining([1]));
        });
      });
    });
  });

  describe("getAutoscores", () => {
    let scoreType = "auto";
    const rubricScores = {1: 10, 2: 20};
    const questionAutoScores = {1: 1, 2: 2};
    let autoScores = null;
    describe("with auto scoreType", () => {
      beforeEach(() => {
        autoScores = getAutoscores(scoreType, rubricScores, questionAutoScores);
      });
      it("should return the questionAutoScores", () => {
        scoreType = "auto";
        expect(autoScores).toEqual(questionAutoScores);
      });
    });
    describe("with rubric scoreType", () => {
      beforeEach(() => {
        scoreType = "rubric";
        autoScores = getAutoscores(scoreType, rubricScores, questionAutoScores);
      });
      it("should return the questionAutoScores", () => {
        expect(autoScores).toEqual(rubricScores);
      });
    });
    describe("with manual scoreType", () => {
      beforeEach(() => {
        scoreType = "manual";
        autoScores = getAutoscores(scoreType, rubricScores, questionAutoScores);
      });
      it("should return the autoScores", () => {
        expect(autoScores).toEqual(questionAutoScores);
      });
    });
  });

  describe("getRubricScores", () => {
    // The rubric we are using to score with …
    const rubricDef = {
      "id": "RBK1",
      "formatVersion": "1.0.0",
      "version": "12",
      "updatedMsUTC": 1519424087822,
      "originUrl": "http://concord.org/rubrics/RBK1.json",
      "scoreUsingPoints": false,
      "showRatingDescriptions": false,
      "criteria": [
        {
          "id": "C1",
          "description": "description",
          "ratingDescriptions": {
            "R1": "Not meeting expected goals.",
            "R2": "Approaching proficiency.",
            "R3": "Exhibiting proficiency."
          }
        },
        {
          "id": "C2",
          "description": "description",
          "ratingDescriptions": {
            "R1": "Not meeting expected goals.",
            "R2": "Approaching proficiency.",
            "R3": "Exhibiting proficiency."
          }
        }
      ],
      "ratings": [
        { "id": "R1", "label": "Beginning", "score": 1 },
        { "id": "R2", "label": "Developing", "score": 2 },
        { "id": "R3", "label": "Proficient", "score": 3 }
      ]
    };

    const feedbacks = {feedbacks: {
      "1-1": {
        key: "1-1",
        platformStudentId: 1,
        learnerId: 201,
        feedback: "second answer",
        hasBeenReviewed: true,
        rubricFeedback: {
          C1: {
            description: "Not meeting expected goals.",
            id: "R1",
            label: "Beginning",
            score: 1
          },
          C2: {
            description: "Not meeting expected goals.",
            id: "R1",
            label: "Beginning",
            score: 1
          }
        }
      }
    }};
    // the collection of feedbacks …
    let scores = null;

    beforeEach(() => {
      scores = getRubricScores(rubricDef, feedbacks);
    });

    it("Should return the score from the most recent rubric feedback", () => {
      expect(scores?.[1]).toBe(2);
    });
  });
});
