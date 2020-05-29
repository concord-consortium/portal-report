import React from "react";
import { Map } from "immutable";

import css from "../../../css/portal-dashboard/level-viewer.less";
import { ProgressLegendContainer } from "./legend-container";

interface IProps {
  activities: Map<any, any>;
  currentActivity?: Map<string, any>;
  toggleCurrentActivity: (activityId: string) => void;
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

  private renderActivityButton = (activity: Map<string, any>) => {
    return (
      <div key={activity.get("id")} className={css.activityButton}>
        <div className={css.activityInnerButton} onClick={this.handleActivityButtonClick(activity.get("id"))}>
          <div className={css.activityTitle}>
            {activity.get("name")}
          </div>
          <div className={css.activityImage} />
        </div>
        <div className={css.externalLink}>
          <a className={css.externalLinkButton} href={activity.get("url")} target="_blank">
            <svg className={css.icon}>
              <use xlinkHref="#external-link" />
            </svg>
          </a>
        </div>
        <div className={css.progressBar} />
      </div>
    );
  }

  private handleActivityButtonClick = (activityId: string) => () => {
    this.props.toggleCurrentActivity(activityId);
  }
}
