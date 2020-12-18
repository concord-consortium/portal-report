import React from "react";

import css from "../../../css/portal-dashboard/progress-legend.less";

export interface ProgressType {
  name: string;
  class: any;
}
export const progress: ProgressType[] =
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

export class ProgressLegendContainer extends React.PureComponent {
  render() {
    return (
      <div className={css.legendContainer} data-cy="progress-legend">
        <div className={css.legendLabel}> Activity Progress:</div>
        { progress.map((progress, index) => {
          const progressName = (progress.name).replace(/\ /g,'-');
          return (
            <div key={index} className={css.legendKey} data-cy={progressName + "-legend"}>
              <div className={`${css.progressIcon} ${progress.class}`}></div>
              <div className={css.legendText}>{progress.name}</div>
            </div>
          );
        })}
      </div>
    );
  }
}
