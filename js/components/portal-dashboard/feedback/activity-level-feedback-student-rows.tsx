import React from "react";
import { Map } from "immutable";
import { ActivityFeedbackTextarea } from "./activity-feedback-textarea";
import { ActivityFeedbackScore } from "./activity-feedback-score";
import { getFormattedStudentName } from "../../../util/student-utils";
import { RubricTableContainer } from "./rubric-table";
import AwaitingFeedbackActivityBadgeIcon from "../../../../img/svg-icons/awaiting-feedback-activity-badge-icon.svg";
import GivenFeedbackActivityBadgeIcon from "../../../../img/svg-icons/given-feedback-activity-badge-icon.svg";
import { SORT_BY_FEEDBACK_PROGRESS } from "../../../actions/dashboard";
import { TrackEventFunction } from "../../../actions";
import { Rubric } from "./rubric-utils";
import { ScoringSettings, hasFeedbackGivenScoreType } from "../../../util/scoring";
import { ShowStudentAnswers } from "./show-student-answers";
import ReportItemIframe from "../report-item-iframe";

import css from "../../../../css/portal-dashboard/feedback/feedback-rows.less";

interface IProps {
  activity: Map<any, any>;
  activityId: string;
  activityIndex: number;
  feedbacks: Map<any, any>;
  feedbacksNeedingReview: Map<any, any>;
  feedbackSortByMethod: string;
  isAnonymous: boolean;
  rubric: Rubric;
  rubricDocUrl: string;
  setFeedbackSortRefreshEnabled: (value: boolean) => void;
  students: Map<any, any>;
  updateActivityFeedback: (activityId: string, activityIndex: number, platformStudentId: string, feedback: any) => void;
  trackEvent: TrackEventFunction;
  scoringSettings: ScoringSettings;
  isResearcher: boolean;
}

export const ActivityLevelFeedbackStudentRows: React.FC<IProps> = (props) => {
  const { activityId, activityIndex, feedbacks, feedbackSortByMethod, isAnonymous, rubric, setFeedbackSortRefreshEnabled,
    students, trackEvent, updateActivityFeedback, scoringSettings, activity, isResearcher, rubricDocUrl } = props;
  const displayedFeedbacks = feedbackSortByMethod !== SORT_BY_FEEDBACK_PROGRESS
    ? feedbacks
    : students.map((student: any) => {
      const feedback = feedbacks.find((f) => f.get("platformStudentId") === student.get("id"));
      return feedback;
    });

  // pre-load all the report item iframes as a hidden iframe so the ShowStudentAnswers component
  // has access to the report item answers when it is toggled open
  const reportItemIframes: JSX.Element[] = (activity.get("questions") || []).reduce((acc: JSX.Element[], question: Map<any, any>) => {
    const hasReportItemUrl = !!question?.get("reportItemUrl");
    if (hasReportItemUrl) {
      acc.push(<ReportItemIframe key={question.get("id")} question={question} view={"hidden"} />);
    }
    return acc;
  }, []);

  const feedbackRows = displayedFeedbacks.map((feedbackData: Map<any, any>) => {
    const student = feedbackData.get("student");
    const studentId = student.get("id");
    const formattedName = getFormattedStudentName(isAnonymous, student);
    const activityStarted = feedbackData.get("activityStarted");
    const feedback = feedbackData.get("feedback");
    const score = feedbackData.get("score");
    const hasRubric = rubric;
    const { rubricFeedback } = feedbackData.toJS();
    const hasFeedbacks = hasFeedbackGivenScoreType({
      scoreType: scoringSettings.scoreType,
      textFeedback: feedbackData.get("feedback"),
      scoreFeedback: feedbackData.get("score"),
      rubric,
      rubricFeedback
    });

    const feedbackBadge = hasFeedbacks ? <GivenFeedbackActivityBadgeIcon /> : <AwaitingFeedbackActivityBadgeIcon />;

    return (
      <div key={activityId + studentId} className={css.feedbackRowsRow} data-cy="feedbackRow">
        <div className={css.studentWrapper}>
          <div className={css.feedbackBadge} data-cy="feedback-badge">
            {activityStarted && feedbackBadge}
          </div>
          <div className={css.studentName} data-cy="student-name">
            {formattedName}
          </div>
        </div>
        <div className={css.feedback} data-cy="feedback-container">
          {activityStarted && hasRubric &&
            <RubricTableContainer
              activityId={activityId}
              activityIndex={activityIndex}
              rubric={rubric}
              rubricDocUrl={rubricDocUrl}
              student={student}
              rubricFeedback={rubricFeedback}
              setFeedbackSortRefreshEnabled={setFeedbackSortRefreshEnabled}
              updateActivityFeedback={updateActivityFeedback}
              scoringSettings={scoringSettings}
            />
          }
          <div className={css.textAndScore} data-cy="feedback-text-and-score">
            <ActivityFeedbackTextarea
              activityId={activityId}
              activityIndex={activityIndex}
              activityStarted={activityStarted}
              feedback={feedback}
              key={activityId + studentId + "-textarea"}
              studentId={studentId}
              setFeedbackSortRefreshEnabled={setFeedbackSortRefreshEnabled}
              updateActivityFeedback={updateActivityFeedback}
              trackEvent={trackEvent}
              isResearcher={isResearcher}
            />
            <ActivityFeedbackScore
              activityId={activityId}
              activityIndex={activityIndex}
              activityStarted={activityStarted}
              score={score}
              key={activityId + studentId + "-score"}
              studentId={studentId}
              setFeedbackSortRefreshEnabled={setFeedbackSortRefreshEnabled}
              updateActivityFeedback={updateActivityFeedback}
              trackEvent={trackEvent}
              scoringSettings={scoringSettings}
              rubricFeedback={rubricFeedback}
              rubric={rubric}
              isResearcher={isResearcher}
            />
          </div>
          <ShowStudentAnswers
            student={student}
            activity={activity}
            activityStarted={activityStarted}
            trackEvent={trackEvent}
          />
        </div>
      </div>
    );
  });

  return (
    <div className={css.feedbackRows}>
      {reportItemIframes}
      {feedbackRows}
    </div>
  );
};
