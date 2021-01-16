import React from "react";
import { Map } from "immutable";
import Answer from "../../../containers/portal-dashboard/answer";
import striptags from "striptags";
import { renderHTML } from "../../../util/render-html";
import AwaitingFeedbackQuestionBadgeIcon from "../../../../img/svg-icons/awaiting-feedback-question-badge-icon.svg";
import GivenFeedbackQuestionBadgeIcon from "../../../../img/svg-icons/given-feedback-question-badge-icon.svg";
// import UpdateFeedbackQuestionBadgeIcon from "../../../../img/svg-icons/update-feedback-question-badge-icon.svg";

import css from "../../../../css/portal-dashboard/feedback/feedback-rows.less";

interface IProps {
  answers: Map<any, any>;
  currentActivity: Map<string, any>;
  currentStudentId: string | null;
  feedbacks: Map<any, any>;
  students: Map<any, any>;
  updateQuestionFeedback: (answerId: string, feedback: any) => void;
}

export const FeedbackQuestionRows: React.FC<IProps> = (props) => {
  const { answers, feedbacks, currentActivity, currentStudentId, students, updateQuestionFeedback } = props;

  const handleFeedbackChange = (answerId: string) => (event: React.FormEvent<HTMLTextAreaElement>) => {
    if (answerId) {
      const target = event.currentTarget as HTMLTextAreaElement;
      updateQuestionFeedback(answerId, {feedback: target.value});
    }
  };

  const questions = currentActivity.get("questions");
  const feedbackRows = questions.map ((question: Map<any, any>) => {
    const student = currentStudentId
                    ? students.toArray().find((s: any) => s.get("id") === currentStudentId)
                    : students.toArray()[0];

    const currentQuestionId = question.get("id");
    const answer = currentStudentId
                   ? answers.getIn([currentQuestionId, currentStudentId])
                   : undefined;
    const answerId = answer?.get("id");
    const feedbackData = answerId && feedbacks.getIn([answerId]);
    const feedback = feedbackData ? feedbackData.get("feedback") : "";

    const awaitingFeedbackIcon = <AwaitingFeedbackQuestionBadgeIcon />;
    const givenFeedbackIcon = <GivenFeedbackQuestionBadgeIcon />;
    // const updateFeedbackIcon = <UpdateFeedbackQuestionBadgeIcon />;

    // TODO: Work out case for when to use UpdateFeedbackBadgeIcon
    let feedbackBadge = awaitingFeedbackIcon;
    if (feedback) {
      feedbackBadge = givenFeedbackIcon;
    }

    const blankRegEx = /\[([^)]+)\]/g;
    const promptText = question?.get("prompt")?.replace(blankRegEx, '__________');

    return (
      <div className={css.feedbackRows__row} key={currentQuestionId} data-cy="question-row">
        <div className={css.studentWrapper} data-cy="question-wrapper">
          <div className={css.feedbackBadge} data-cy="feedback-badge">
            {feedbackBadge}
          </div>
          <div className={css.studentName} data-cy="student-name">
            Q{question.get("questionNumber")}: {renderHTML(striptags(promptText))}
          </div>
        </div>
        <div className={css.studentResponse} data-cy="student-response">
          <Answer question={question} student={student} responsive={false} />
        </div>
        <div className={css.feedback} data-cy="feedback-container">
          {answer && <textarea defaultValue={feedback} onChange={handleFeedbackChange(answerId)} data-cy="feedback-textarea"></textarea>}
        </div>
      </div>
    );
  });

  return (
    <div className={css.feedbackRows}>
      {feedbackRows}
    </div>
  );
};
