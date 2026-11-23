import React from "react";
import { render } from "@testing-library/react";
import { fromJS, List, Map } from "immutable";
import { QuestionLevelFeedbackStudentRows } from "../../../js/components/portal-dashboard/feedback/question-level-feedback-student-rows";

// The answer container needs the Redux store, which this test doesn't cover.
jest.mock("../../../js/containers/portal-dashboard/answer", () => () => null);

describe("<QuestionLevelFeedbackStudentRows />", () => {
  const students = fromJS([
    { id: "1", firstName: "John", lastName: "Jenkins", name: "Student 1" },
    { id: "2", firstName: "Test", lastName: "Teacher", name: "Student 2 (LM)", isTeacherPreviewStudent: true },
  ]) as List<any>;

  it("gives a teacher's learner mode account the (LM) tooltip", () => {
    const { getAllByTitle } = render(
      <QuestionLevelFeedbackStudentRows
        activityId="activity_1"
        activityIndex={0}
        answers={Map()}
        currentQuestion={Map({ id: "question_1" })}
        feedbacks={Map()}
        feedbacksNeedingReview={Map()}
        hideLastRun={true}
        isAnonymous={false}
        isCompact={false}
        setFeedbackSortRefreshEnabled={jest.fn()}
        students={students}
        updateQuestionFeedback={jest.fn()}
        trackEvent={jest.fn()}
        isResearcher={false}
      />
    );
    const tooltips = getAllByTitle("Learner Mode user");
    expect(tooltips.map(el => el.textContent)).toEqual(["LM"]);
    expect(tooltips[0].closest("[data-cy=student-name]")?.textContent).toContain("Teacher, Test");
  });
});
