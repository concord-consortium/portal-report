import React from "react";
import Answer from "../../containers/portal-dashboard/answer";
import { getFormattedStudentName } from "../../util/student-utils";
import striptags from "striptags";
import { renderHTML } from "../../util/render-html";
import AwaitingFeedbackActivityBadgeIcon from "../../../img/svg-icons/awaiting-feedback-activity-badge-icon.svg";
import GivenFeedbackActivityBadgeIcon from "../../../img/svg-icons/given-feedback-activity-badge-icon.svg";
import AwaitingFeedbackQuestionBadgeIcon from "../../../img/svg-icons/awaiting-feedback-question-badge-icon.svg";
import GivenFeedbackQuestionBadgeIcon from "../../../img/svg-icons/given-feedback-question-badge-icon.svg";
import UpdateFeedbackQuestionBadgeIcon from "../../../img/svg-icons/update-feedback-question-badge-icon.svg";
import { FeedbackLevel } from "../../../util/misc";

import css from "../../../css/portal-dashboard/feedback/feedback-rows.less";

interface IProps {
  feedbacks: Map<any, any>;
  feedbacksNeedingReview: Map<any, any>;
  answers: any;
  currentQuestion: any;
  isAnonymous: boolean;
  feedbackLevel: FeedbackLevel;
  activities: Map<any, any>;
  currentActivity: Map<string, any>;
  currentStudentId: string | null;
  students: Map<any, any>;
  updateActivityFeedback: (activityId: string, activityIndex: number, platformStudentId: string, feedback: any) => void;
  activityId: string | null;
  activityIndex: number;
}

export const FeedbackQuestionRows: React.FC<IProps> = (props) => {
  const { answers, currentQuestion, feedbacks, isAnonymous, feedbackLevel, activities, currentActivity, currentStudentId, students, updateActivityFeedback, activityId, activityIndex } = props;

  const onChangeHandler = (studentId: string) => (event: React.FormEvent<HTMLInputElement>) => {
    if (activityId && studentId != null) {
      updateActivityFeedback(activityId, activityIndex, studentId, event.target.value);
    }
  };

  // eslint-disable-next-line no-console
  console.log(feedbacks);

  const questions = currentActivity.get("questions");
  const feedbackRows = questions.map ((question: Map<any, any>, index: number) => {

    const currentActivityId = currentActivity?.get("id");
    const student = currentStudentId
                    ? students.toArray().find((s: any) => s.get("id") === currentStudentId)
                    : students.toArray()[0];
    const formattedName = getFormattedStudentName(isAnonymous, student);
    const activity = currentActivityId
                     ? activities.toArray().find((a: any) => a.get("id") === currentActivityId)
                     : activities.toArray()[0];
    
    // feedbackData needs to be updated to get feedback for each individual question
    const feedbackData = currentStudentId
                         ? feedbacks.toArray().find((f: any) => f.get("platformStudentId") === currentStudentId)
                         : feedbacks.toArray()[0];
    const activityStarted = feedbackData.get("activityStarted");
    const hasBeenReviewed = feedbackData.get("hasBeenReviewed");
    const feedback = feedbackData.get("feedback");

    const questionNumber = currentQuestion.get("questionNumber");
    const questionPrompt = currentQuestion.get("prompt");

    const awaitingFeedbackIcon = feedbackLevel === "Activity" ? <AwaitingFeedbackActivityBadgeIcon /> : <AwaitingFeedbackQuestionBadgeIcon />;
    const givenFeedbackIcon = feedbackLevel === "Activity" ? <GivenFeedbackActivityBadgeIcon /> : <GivenFeedbackQuestionBadgeIcon />;
    const updateFeedbackIcon = <UpdateFeedbackQuestionBadgeIcon />;

    // TODO: Work out case for when to use UpdateFeedbackBadgeIcon
    let feedbackBadge = awaitingFeedbackIcon;
    if (hasBeenReviewed) {
      feedbackBadge = givenFeedbackIcon;
    }
  
    const blankRegEx = /\[([^)]+)\]/g;
    const promptText = question?.get("prompt")?.replace(blankRegEx, '__________');

    return (
      <div className={css.feedbackRows__row} key={`question ${index}`} data-cy="question-row">
        <div className={css.studentWrapper} data-cy="question-wrapper">
          <div className={css.feedbackBadge}>
            {feedbackBadge}
          </div>
          <div className={css.studentName}>
            Q{question.get("questionNumber")}: {renderHTML(striptags(promptText))}
          </div>
        </div>
        <div className={css.studentResponse} data-cy="student-response">
          <Answer question={question} student={student} responsive={false} />
        </div>
        <div className={css.feedback}>
        {activityStarted &&
          <textarea defaultValue={feedback} onChange={onChangeHandler(currentStudentId)}></textarea>
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
