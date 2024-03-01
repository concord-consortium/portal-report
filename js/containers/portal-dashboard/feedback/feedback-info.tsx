import React from "react";
import { connect } from "react-redux";
import { Map } from "immutable";
import { FeedbackLegend } from "../../../components/portal-dashboard/feedback/feedback-legend";
import { FeedbackLevel, ListViewMode } from "../../../util/misc";

import css from "../../../../css/portal-dashboard/feedback/feedback-info.less";

interface IProps {
  feedbackLevel: FeedbackLevel;
  listViewMode: ListViewMode;
  setFeedbackLevel: (value: string) => void;
  activity: Map<any, any>;
}

export const FeedbackInfo: React.FC<IProps> = (props) => {
  const {activity, feedbackLevel, listViewMode, setFeedbackLevel } = props;

  const handleActivityButtonClick = () => {
    setFeedbackLevel("Activity");
  };

  const handleQuestionButtonClick = () => {
    setFeedbackLevel("Question");
  };

  const activityButtonClass = feedbackLevel === "Activity"
                              ? css.active + " " + css.viewToggleButtonActivity
                              : css.viewToggleButtonActivity;
  const questionButtonClass = feedbackLevel !== "Activity"
                              ? css.active + " " + css.viewToggleButtonQuestion
                              : css.viewToggleButtonQuestion;

  return (
    <div className={css.feedbackInfo} data-cy="feedback-info">
      <div className={css.titleWrapper}>
        <div className={css.title}>Feedback Level:</div>
        <div className={css.viewToggle}>
          <button className={activityButtonClass} onClick={handleActivityButtonClick} disabled={listViewMode === "Question"} data-cy="activity-level-feedback-button">
            Activity
          </button>
          <button className={questionButtonClass} onClick={handleQuestionButtonClick} data-cy="question-level-feedback-button">
            Questions
          </button>
        </div>
      </div>
      <FeedbackLegend feedbackLevel={feedbackLevel} activity={activity} />
    </div>
  );

};

function mapStateToProps() {
  return (state: any, ownProps: any) => {
    const rubric = state.getIn(["feedback", "settings", "rubric"]);
    return {
      rubric: rubric && rubric.toJS()
    };
  };
}

export default connect(mapStateToProps)(FeedbackInfo);
