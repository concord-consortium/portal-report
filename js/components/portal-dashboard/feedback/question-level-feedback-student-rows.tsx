import React from "react";
import { Map, List } from "immutable";
import Answer from "../../../containers/portal-dashboard/answer";
import { QuestionFeedbackTextarea } from "./question-feedback-textarea";
import { feedbackValidForAnswer } from "../../../util/misc";
import { getFormattedStudentName } from "../../../util/student-utils";
import AwaitingFeedbackQuestionBadgeIcon from "../../../../img/svg-icons/awaiting-feedback-question-badge-icon.svg";
import GivenFeedbackQuestionBadgeIcon from "../../../../img/svg-icons/given-feedback-question-badge-icon.svg";
import UpdateFeedbackQuestionBadgeIcon from "../../../../img/svg-icons/update-feedback-question-badge-icon.svg";
import { TrackEventFunction } from "../../../actions";
import { LastRunRow } from "../last-run-row";

import css from "../../../../css/portal-dashboard/feedback/feedback-rows.less";
// Import shared styles for visual consistency of "Last Run" column.
import lastRunCss from "../../../../css/portal-dashboard/last-run-column.less";

interface IProps {
  activityId: string | null;
  activityIndex: number;
  answers: Map<any, any>;
  currentQuestion: Map<any, any>;
  feedbacks: Map<any, any>;
  feedbacksNeedingReview: Map<any, any>;
  hideLastRun: boolean;
  isAnonymous: boolean;
  isCompact: boolean;
  setFeedbackSortRefreshEnabled: (value: boolean) => void;
  students: List<any>;
  updateQuestionFeedback: (answerId: string, feedback: any) => void;
  trackEvent: TrackEventFunction;
  isResearcher: boolean;
}

export const QuestionLevelFeedbackStudentRows: React.FC<IProps> = (props) => {
  const { answers, currentQuestion, feedbacks, hideLastRun, isAnonymous, isCompact, students, activityId, updateQuestionFeedback,
          trackEvent, isResearcher } = props;

  const getFeedbackIcon = (feedback: string, feedbackData: Map<string, any>, answer: Map<string, any>) => {
    let feedbackBadge = <AwaitingFeedbackQuestionBadgeIcon />;
    if (feedback !== "") {
      feedbackBadge = feedbackValidForAnswer(feedbackData, answer)
                      ? <GivenFeedbackQuestionBadgeIcon />
                      : <UpdateFeedbackQuestionBadgeIcon />;
    }

    return feedbackBadge;
  };

  const feedbackRows = students.map ((student: Map<any, any>) => {
    const studentId = student.get("id");
    const currentQuestionId = currentQuestion.get("id");
    const formattedName = getFormattedStudentName(isAnonymous, student);
    const answer = answers.getIn([currentQuestionId, studentId]) as Map<any, any>;
    const answerId = answer?.get("id");
    const feedbackData = feedbacks.get(answerId);
    const feedback = feedbackData ? feedbackData.get("feedback") : "";
    const feedbackBadge = getFeedbackIcon(feedback, feedbackData, answer);
    const feedbackTimestamp = feedbackData?.get("updatedAt")?.toDate().toLocaleString() || undefined;
    const compactClass = isCompact ? lastRunCss.compact : "";

    return (
      <div key={currentQuestionId + studentId} className={css.feedbackRowsRow} data-cy="feedbackRow">
        <div className={css.studentWrapper}>
          <div className={css.feedbackBadge} data-cy="feedback-badge">
            { answer && feedbackBadge }
          </div>
          <div className={css.studentName} data-cy="student-name">
            {formattedName}
          </div>
        </div>
        {!hideLastRun &&
          <div className={`${lastRunCss.lastRunColumn} ${compactClass}`} data-cy="last-run-column">
            <LastRunRow lastRun={student.get("lastRun")} showBorders={true} />
          </div>
        }
        <div className={css.studentResponse}>
          <Answer question={currentQuestion} student={student} responsive={false} studentName={formattedName} />
        </div>
        <div className={css.feedback} data-cy="feedback-container">
          { answer &&
            <QuestionFeedbackTextarea
              answer={answer}
              answerId={answerId}
              feedback={feedback}
              studentId={studentId}
              questionId={currentQuestionId}
              activityId={activityId}
              key={currentQuestionId + studentId + "-textarea"}
              setFeedbackSortRefreshEnabled={props.setFeedbackSortRefreshEnabled}
              updateQuestionFeedback={updateQuestionFeedback}
              trackEvent={trackEvent}
              isResearcher={isResearcher}
              feedbackTimestamp={feedbackTimestamp}
            />
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
