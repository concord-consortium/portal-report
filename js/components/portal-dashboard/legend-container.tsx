import React from "react";

import css from "../../../css/portal-dashboard/progress-view-legend.less";

export interface LegendType {
  name: string;
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
      name: "",
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

export class ProgressLegendContainer extends React.PureComponent {
  render() {
    return (
      <div className={css.legendContainer} data-cy="legend-containter">
        <div className={css.progressLegend} data-cy="progress-legend">
          <div className={css.legendLabel}> Activity Progress:</div>
          { progress.map((progress, index) => {
            const progressName = (progress.name).replace(/\ /g,'-');
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
          <div className={css.legendLabel}> Feedback:</div>
          { feedback.map((feedback, index) => {
            const feedbackName = (feedback.name).replace(/\ /g,'-');
            return (
              <div key={index} className={css.legendKey} data-cy={feedbackName + "-legend"}>
                <div className={`${css.feedbackIcon} ${feedback.class}`}></div>
                <div className={css.legendText}>{feedback.name}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}
