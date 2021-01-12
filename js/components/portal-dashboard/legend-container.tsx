import React from "react";
import ProgressNotYetStarted from "../../../img/svg-icons/progress-not-yet-started-icon.svg";
import ProgressInProgressIcon from "../../../img/svg-icons/progress-in-progress-icon.svg";
import ProgressCompletedIcon from "../../../img/svg-icons/progress-completed-icon.svg";
import FeedbackActivityKeyIcon from "../../../img/svg-icons/feedback-activity-key-icon.svg";
import FeedbackQuestionKeyIcon from "../../../img/svg-icons/feedback-question-key-icon.svg";
import FeedbackAnswerUpdatedKeyIcon from "../../../img/svg-icons/feedback-answer-updated-key-icon.svg";

import css from "../../../css/portal-dashboard/progress-view-legend.less";

export interface LegendType {
  name?: string;
  icon: any;
}
export const progress: LegendType[] =
  [
    {
      name: "Completed",
      icon: ProgressCompletedIcon
    },
    {
      name: "In progress",
      icon: ProgressInProgressIcon
    },
    {
      name: "Not started",
      icon: ProgressNotYetStarted
    }
  ];

  export const feedback: LegendType[] =
  [
    {
      icon: FeedbackActivityKeyIcon
    },
    {
      name: "Given",
      icon: FeedbackQuestionKeyIcon
    },
    {
      name: "Answer Updated",
      icon: FeedbackAnswerUpdatedKeyIcon
    },
  ];

interface IProps {
  hideFeedbackBadges: boolean;
}
export class ProgressLegendContainer extends React.PureComponent<IProps>{
  render() {
    return (
      <div className={css.legendContainer} data-cy="legend-containter">
        <div className={css.progressLegend} data-cy="progress-legend">
          <div className={css.legendLabel}>Activity Progress:</div>
          { progress.map((progress, index) => {
            const progressName = progress.name? progress.name.replace(/\ /g,'-') : "no-title";
            return (
              <div key={index} className={css.legendKey} data-cy={progressName + "-legend"}>
                <progress.icon className={`${css.legendIcon}`}/>
                <div className={css.legendText}>{progress.name}</div>
              </div>
            );
          })}
        </div>
        <div className={css.divider}></div>
        <div className={css.feedbackLegend} data-cy="feedback-legend">
          <div className={css.legendLabel}>Feedback:</div>
          { feedback.map((feedback, index) => {
            const feedbackName = feedback.name ? feedback.name.replace(/\ /g,'-') : "no-title";
            return (
              <div key={index}
                className={`${css.legendKey} ${this.props.hideFeedbackBadges? css.disabled: ""}`}
                data-cy={`${feedbackName}-legend${this.props.hideFeedbackBadges ? "-disabled" : ""}`}
              >
                { feedback.name === undefined
                  ? <feedback.icon className={`${css.legendIcon} ${css.feedbackIcon}`} />
                  : <feedback.icon className={`${css.legendIcon} ${css.feedbackIcon} ${css.questionFeedbackGiven}`} />
                }
                <div className={`${css.legendText} ${!feedback.name && css.noText}`}>{feedback.name}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}
