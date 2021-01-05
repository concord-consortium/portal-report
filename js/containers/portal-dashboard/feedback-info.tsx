import React, { useState } from "react";
import { connect } from "react-redux";
import {FeedbackNoteToggle} from "../../components/portal-dashboard/feedback-note-toggle";
import {FeedbackLegend} from "../../components/portal-dashboard/feedback-legend";
import { ColorTheme } from "../../util/misc";

import css from "../../../css/portal-dashboard/feedback/feedback-info.less";

interface IProps {
  activity: Map<any, any>;
  rubric: any;
  feedbackLevel: "Activity" | "Question";
  listViewMode: listViewMode;
  setFeedbackLevel: (value: string) => void;
}

export const FeedbackInfo: React.FC<IProps> = (props) => {
  const {feedbackLevel, setFeedbackLevel, listViewMode} = props;

  const handleActivityButtonClick = () => {
    setFeedbackLevel("Activity");
  };

  const handleQuestionButtonClick = () => {
    setFeedbackLevel("Question");
  };

  const activityButtonClass = feedbackLevel === "Activity" ? css.active + " " + css.viewToggle__button__activity : css.viewToggle__button__activity;
  const questionButtonClass = feedbackLevel !== "Activity" ? css.active + " " + css.viewToggle__button__question : css.viewToggle__button__question;

  const { colorTheme } = "feedbackAssignment";

  return (
    <div className={css.feedbackInfo}>
      <div className={css.titleWrapper}>
        <div className={css.title}>Feedback Level:</div>
        <div className={css.viewToggle}>
          <button className={activityButtonClass} onClick={handleActivityButtonClick} disabled={listViewMode === "Question"}>Activity</button>
          <button className={questionButtonClass} onClick={handleQuestionButtonClick}>Questions</button>
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
