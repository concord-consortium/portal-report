import React from "react";
import { connect } from "react-redux";
import { FeedbackLegend } from "../../../components/portal-dashboard/feedback/feedback-legend";
import { FeedbackLevel, ListViewMode } from "../../../util/misc";

import css from "../../../../css/portal-dashboard/feedback/feedback-info.less";

interface IProps {
  feedbackLevel: FeedbackLevel;
  listViewMode: ListViewMode;
  rubric?: any;
  setFeedbackLevel: (value: string) => void;
}

export const FeedbackInfo: React.FC<IProps> = (props) => {
  const { feedbackLevel, listViewMode, setFeedbackLevel, rubric } = props;

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
      <FeedbackLegend feedbackLevel={feedbackLevel} rubric={rubric} />
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
