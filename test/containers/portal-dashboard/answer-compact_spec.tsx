import React from "react";
import { render } from '@testing-library/react';
import { Map, List } from "immutable";
import { AnswerCompact } from "../../../js/containers/portal-dashboard/answer-compact";

describe("<AnswerCompact />", () => {
  const student = Map({ id: "s1" });
  const answer = Map({
    questionId: "q1",
    questionType: "open_response",
    answer: "answer foo bar",
    platformUserId: "s1"
  });
  const interactiveStateHistory: List<Map<string, any>> = List();

  describe("when question specifies reportItemUrl", () => {
    const question = Map({ id: "q1", reportItemUrl: "foobar.com" });

    it("should call getReportItemAnswer on initial mount and each time when answer is updated", () => {
      const getReportItemAnswer = jest.fn();

      const { rerender } = render(<AnswerCompact
        answer={answer}
        question={question}
        student={student}
        getReportItemAnswer={getReportItemAnswer}
        hideFeedbackBadges={false}
        feedback={Map()}
        trackEvent={jest.fn()}
        answerOrientation="wide"
        interactiveStateHistory={interactiveStateHistory}
      />);
      expect(getReportItemAnswer).toHaveBeenCalledTimes(1);

      rerender(<AnswerCompact
        answer={answer}
        question={question}
        student={student}
        getReportItemAnswer={getReportItemAnswer}
        hideFeedbackBadges={false}
        feedback={Map()}
        trackEvent={jest.fn()}
        answerOrientation="wide"
        interactiveStateHistory={interactiveStateHistory}
      />);
      // Nothing has changed, getReportItemAnswer should not be called again.
      expect(getReportItemAnswer).toHaveBeenCalledTimes(1);

      const newAnswer = answer.set("answer", "new answer");
      rerender(<AnswerCompact
        answer={newAnswer}
        question={question}
        student={student}
        getReportItemAnswer={getReportItemAnswer}
        hideFeedbackBadges={false}
        feedback={Map()}
        trackEvent={jest.fn()}
        answerOrientation="wide"
        interactiveStateHistory={interactiveStateHistory}
      />);
      // Answer has been updated, getReportItemAnswer should be called again.
      expect(getReportItemAnswer).toHaveBeenCalledTimes(2);
    });
  });

  describe("when question doesn't specify reportItemUrl", () => {
    const question = Map({ id: "q1" });

    it("should not call getReportItemAnswer", () => {
      const getReportItemAnswer = jest.fn();

      const { rerender } = render(<AnswerCompact
        answer={answer}
        question={question}
        student={student}
        getReportItemAnswer={getReportItemAnswer}
        hideFeedbackBadges={false}
        feedback={Map()}
        trackEvent={jest.fn()}
        answerOrientation="wide"
        interactiveStateHistory={interactiveStateHistory}
      />);
      expect(getReportItemAnswer).not.toHaveBeenCalled();

      const newAnswer = answer.set("answer", "new answer");
      rerender(<AnswerCompact
        answer={newAnswer}
        question={question}
        student={student}
        getReportItemAnswer={getReportItemAnswer}
        hideFeedbackBadges={false}
        feedback={Map()}
        trackEvent={jest.fn()}
        answerOrientation="wide"
        interactiveStateHistory={interactiveStateHistory}
      />);
      expect(getReportItemAnswer).not.toHaveBeenCalled();
    });
  });
});
