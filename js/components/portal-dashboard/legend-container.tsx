import React from "react";

import css from "../../../css/portal-dashboard/progress-view-legend.less";

export interface LegendType {
  name: string | null;
  class: any;
}
export const progress: LegendType[] =
  [
    {
      name: "Completed",
      class: css.completed
    },
    {
      name: "In progress",
      class: css.inProgress
    },
    {
      name: "Not started",
      class: css.notStarted
    }
  ];

  export const feedback: LegendType[] =
  [
    {
      name: null,
      class: css.activityFeedbackGiven
    },
    {
      name: "Given",
      class: css.questionFeedbackGiven
    },
    {
      name: "Answer Updated",
      class: css.answerUpdated
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
                <div className={`${css.legendIcon} ${css.progressIcon} ${progress.class}`}></div>
                <div className={css.legendText}>{progress.name}</div>
              </div>
            );
          })}
        </div>
        <div className={css.divider}></div>
        <div className={css.feedbackLegend} data-cy="feedback-legend">
          <div className={css.legendLabel}>Feedback:</div>
          { feedback.map((feedback, index) => {
            const feedbackName = feedback.name? feedback.name.replace(/\ /g,'-') : "no-title";
            return (
              <div key={index}
                   className={`${css.legendKey} ${this.props.hideFeedbackBadges? css.disabled: ""}`}
                   data-cy={`${feedbackName}-legend${this.props.hideFeedbackBadges ? "-disabled" : ""}`}>
                  {feedback.name === "Answer Updated"
                    ? <div className={`${css.legendIcon} ${css.feedbackIcon} ${css.questionFeedbackGiven}`}>
                        <div className={`${feedback.class}`}></div>
                      </div>
                    : <div className={`${css.legendIcon} ${css.feedbackIcon} ${feedback.class}`}></div>
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
