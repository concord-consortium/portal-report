import React from "react";
import { Map } from "immutable";

import css from "../../../css/portal-dashboard/level-viewer.less";
import { ProgressLegendContainer } from "./legend-container";

interface IProps {
  activities: Map<any, any>;
}

export class LevelViewer extends React.PureComponent<IProps> {
  render() {
    const { activities } = this.props;
    return (
      <div className={css.levelViewer} data-cy="level-viewer">
        <div className={css.activityButtons}>
          {
            activities.toArray().map(this.renderActivityButton)
          }
        </div>
        <ProgressLegendContainer />
      </div>
    );
  }

  private renderActivityButton(activity: Map<string, any>) {
    return (
      <div key={activity.get("id")} className={css.activityButton}>
        <div className={css.activityInnerButton}>
          <div className={css.activityTitle}>
            {activity.get("name")}
          </div>
          <div className={css.activityImage} />
        </div>
        <div className={css.externalLink}>
          <div className={css.externalLinkButton}>
            <svg className={css.icon}>
              <use xlinkHref="#external-link" />
            </svg>
          </div>
        </div>
        <div className={css.progressBar} />
      </div>
    );
  }
}
