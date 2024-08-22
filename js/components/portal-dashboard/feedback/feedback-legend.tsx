import React from "react";
import { Map } from "immutable";
import { connect } from "react-redux";
import AwaitingFeedbackActivityBadgeIcon from "../../../../img/svg-icons/awaiting-feedback-activity-badge-icon.svg";
import GivenFeedbackActivityBadgeIcon from "../../../../img/svg-icons/given-feedback-activity-badge-icon.svg";
import AwaitingFeedbackQuestionBadgeIcon from "../../../../img/svg-icons/awaiting-feedback-question-badge-icon.svg";
import GivenFeedbackQuestionBadgeIcon from "../../../../img/svg-icons/given-feedback-question-badge-icon.svg";
import UpdateFeedbackQuestionBadgeIcon from "../../../../img/svg-icons/update-feedback-question-badge-icon.svg";
import { FeedbackLevel } from "../../../util/misc";
import { FeedbackNoteToggle } from "./feedback-note-toggle";
import { FeedbackSettingsToggle } from "./feedback-settings-toggle";
import { ScoringSettings, computeAvgScore } from "../../../util/scoring";
import { MANUAL_SCORE, RUBRIC_SCORE } from "../../../util/scoring-constants";
import { Rubric } from "./rubric-utils";
import { makeGetStudentFeedbacks } from "../../../selectors/activity-feedback-selectors";
import { RubricSummaryIcon } from "./rubric-summary-icon";
import { TrackEventFunction } from "../../../actions";

import css from "../../../../css/portal-dashboard/feedback/feedback-legend.less";

interface IProps {
  feedbackLevel: FeedbackLevel;
  activity: Map<any, any>;
  scoringSettings: ScoringSettings;
  rubric: Rubric;
  rubricDocUrl: string;
  avgScore: number;
  avgScoreMax: number;
  feedbacks: any;
  trackEvent: TrackEventFunction;
  isResearcher: boolean;
}

const FeedbackLegend: React.FC<IProps> = (props) => {
  const { feedbackLevel, activity, scoringSettings, avgScore, avgScoreMax, rubric, rubricDocUrl, feedbacks, trackEvent, isResearcher } = props;
  const { scoreType } = scoringSettings;
  const awaitingFeedbackIcon = feedbackLevel === "Activity"
                               ? <AwaitingFeedbackActivityBadgeIcon />
                               : <AwaitingFeedbackQuestionBadgeIcon />;
  const givenFeedbackIcon = feedbackLevel === "Activity"
                            ? <GivenFeedbackActivityBadgeIcon />
                            : <GivenFeedbackQuestionBadgeIcon />;
  const updateFeedbackIcon = <UpdateFeedbackQuestionBadgeIcon />;
  const showAvgScore = scoreType === RUBRIC_SCORE || scoreType === MANUAL_SCORE;
  const formattedAvgScore = Number.isInteger(avgScore) ? avgScore.toString() : avgScore.toFixed(2).replace(/0+$/, "");

  return (
    <aside className={css.feedbackBadgeLegend} data-cy="feedback-badge-legend">
      <div className={css.feedbackBadgeLegend__heading_container}>
        <h2 className={css.feedbackBadgeLegend__heading}>{feedbackLevel}-level Feedback Key</h2>
        <FeedbackNoteToggle feedbackLevel={feedbackLevel} />
      </div>
      <dl className={css.feedbackBadgeLegend__list}>
        <dt>{awaitingFeedbackIcon}</dt>
        <dd>Awaiting feedback</dd>
        <dt>{givenFeedbackIcon}</dt>
        <dd>Feedback given</dd>
        { feedbackLevel === "Question" &&
          <React.Fragment>
            <dt>{updateFeedbackIcon}</dt>
            <dd>Student answer updated since feedback given</dd>
          </React.Fragment>
        }
      </dl>
      {feedbackLevel === "Activity" &&
        <div className={css.feedbackBadgeLegend__rubric}>
          <div className={css.feedbackBadgeLegend__rubric_settings}>
            <FeedbackSettingsToggle activity={activity} scoringSettings={scoringSettings} feedbacks={feedbacks} trackEvent={trackEvent} isResearcher={isResearcher} />
          </div>
          <div className={css.feedbackBadgeLegend__rubric_score}>
            {showAvgScore && <div className={css.feedbackBadgeLegend__rubric_score_avg}>
              Avg. Score:
              <div className={css.feedbackBadgeLegend__rubric_score_avg_value}>{formattedAvgScore} / {avgScoreMax}</div>
            </div>}
            {rubric && <div className={css.feedbackBadgeLegend__rubric_summary}>
              Rubric Summary:
              <RubricSummaryIcon rubric={rubric} rubricDocUrl={rubricDocUrl} scoringSettings={scoringSettings} feedbacks={feedbacks} activityId={activity.get("id")} trackEvent={trackEvent} />
            </div>}
          </div>
        </div>
      }
    </aside>
  );
};

function mapStateToProps() {
  return (state: any, ownProps: any) => {
    const getFeedbacks: any = makeGetStudentFeedbacks();
    const feedbacks = getFeedbacks(state, ownProps);
    const {avgScoreMax, avgScore} = computeAvgScore(ownProps.scoringSettings, ownProps.rubric, feedbacks);

    return {
      avgScoreMax, avgScore, feedbacks
    };
  };
}

export default connect(mapStateToProps)(FeedbackLegend);
