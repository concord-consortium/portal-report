import React from "react";
import { connect } from "react-redux";
import { FeedbackNoteToggle } from "../../../components/portal-dashboard/feedback/feedback-note-toggle";
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
  const { feedbackLevel, listViewMode, setFeedbackLevel } = props;

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
    <div className={css.feedbackInfo}>
      <div className={css.titleWrapper}>
        <div className={css.title}>Feedback Level:</div>
        <div className={css.viewToggle}>
          <button className={activityButtonClass} onClick={handleActivityButtonClick} disabled={listViewMode === "Question"}>
            Activity
          </button>
          <button className={questionButtonClass} onClick={handleQuestionButtonClick}>
            Questions
          </button>
        </div>
      </div>
      <FeedbackNoteToggle feedbackLevel={feedbackLevel} />
      <FeedbackLegend feedbackLevel={feedbackLevel} />
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
