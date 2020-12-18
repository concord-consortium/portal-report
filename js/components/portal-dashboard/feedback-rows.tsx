import React from "react";
import Answer from "../../containers/portal-dashboard/answer";
import { getFormattedStudentName } from "../../util/student-utils";
import AwaitingFeedbackActivityBadgeIcon from "../../../img/svg-icons/awaiting-feedback-activity-badge-icon.svg";
import GivenFeedbackActivityBadgeIcon from "../../../img/svg-icons/given-feedback-activity-badge-icon.svg";
import AwaitingFeedbackQuestionBadgeIcon from "../../../img/svg-icons/awaiting-feedback-question-badge-icon.svg";
import GivenFeedbackQuestionBadgeIcon from "../../../img/svg-icons/given-feedback-question-badge-icon.svg";
import UpdateFeedbackQuestionBadgeIcon from "../../../img/svg-icons/update-feedback-question-badge-icon.svg";

import css from "../../../css/portal-dashboard/feedback/feedback-rows.less";

interface IProps {
  feedbacks: Map<any, any>;
  feedbacksNeedingReview: Map<any, any>;
  answers: any;
  currentQuestion: any;
  isAnonymous: boolean;
  feedbackLevel: "Activity" | "Question";
}

export const FeedbackRows: React.FC<IProps> = (props) => {
  const { answers, currentQuestion, feedbacks, isAnonymous, feedbackLevel } = props;

  const onChangeHandler = () => {
    // autosave feedback
  };

  const feedbackRows = feedbacks.map ((feedbackData: Map<any, any>, index: number) => {
    const student = feedbackData.get("student");
    const formattedName = getFormattedStudentName(isAnonymous, student);
    const activityStarted = feedbackData.get("activityStarted");
    const hasBeenReviewed = feedbackData.get("hasBeenReviewed");
    const feedback = feedbackData.get("feedback");

    const awaitingFeedbackIcon = feedbackLevel === "Activity" ? <AwaitingFeedbackActivityBadgeIcon /> : <AwaitingFeedbackQuestionBadgeIcon />;
    const givenFeedbackIcon = feedbackLevel === "Activity" ? <GivenFeedbackActivityBadgeIcon /> : <GivenFeedbackQuestionBadgeIcon />;
    const updateFeedbackIcon = <UpdateFeedbackQuestionBadgeIcon />;

    // TODO: Work out case for when to use UpdateFeedbackBadgeIcon
    let feedbackBadge = awaitingFeedbackIcon;
    if (hasBeenReviewed) {
      feedbackBadge = givenFeedbackIcon;
    }

    return (
      <div key={index} className={css.feedbackRows__row}>
        <div className={css.studentWrapper}>
          <div className={css.feedbackBadge}>
            {feedbackBadge}
          </div>
          <div className={css.studentName}>
            {formattedName}
          </div>
        </div>
        {feedbackLevel === "Question" &&
          <div className={css.studentResponse}>
            <Answer question={currentQuestion} student={student} responsive={false} studentName={formattedName} />
          </div>
        }
        <div className={css.feedback}>
          {activityStarted &&
            <textarea value={feedback} onChange={onChangeHandler}></textarea>
          }
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
