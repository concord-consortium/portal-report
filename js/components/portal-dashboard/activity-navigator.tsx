import React from "react";
import { Map } from "immutable";
import ArrowLeftIcon from "../../../img/svg-icons/arrow-left-icon.svg";

import css from "../../../css/portal-dashboard/activity-navigator.less";


interface IProps {
  activities: Map<any, any>;
  currentActivity?: Map<string, any>;
  setCurrentActivity: (activityId: string) => void;
  setCurrentQuestion: (questionId: string) => void;
}

export class ActivityNavigator extends React.PureComponent<IProps> {
  render() {
    const { activities, currentActivity } = this.props;
    const currentActivityId = currentActivity? currentActivity.get("id") : activities.first().get("id");
    const currentActivityIndex = activities.toArray().findIndex((a: any) => a.get("id") === currentActivityId);
    return (
      <div className={css.activityNav} data-cy="activity-navigator">
          <div className={css.navButtons}>
            <div className={`${css.button} ${currentActivityIndex === 0 ? css.disabled : ""}`}
              onClick={this.handleNavigation(currentActivityIndex - 1)} data-cy="activity-navigator-previous-button">
              <ArrowLeftIcon className={css.icon} />
            </div>
            <div className={`${css.button} ${currentActivityIndex === activities.size-1 ? css.disabled : ""}`}
              onClick={this.handleNavigation(currentActivityIndex + 1)} data-cy="activity-navigator-next-button">
              <ArrowLeftIcon className={css.icon} />
            </div>
          </div>
          <div className={css.title} data-cy="activity-title">
            Activity #{currentActivityIndex+1}: {currentActivity ? currentActivity.get("name")
                                                                 : activities.toArray()[currentActivityIndex].get("name")}
          </div>
      </div>
    );
  }

  private handleNavigation  = (activityIndex: number) => () =>{
    const { activities, setCurrentActivity, setCurrentQuestion} = this.props;
    const newActivityId = activities.toArray()[activityIndex].get("id");
    const newQuestionId = (activities.toArray()[activityIndex]).get("questions").first().get("id");
    console.log(activityIndex, (activities.toArray()[activityIndex]).get("questions").first().get("id"), "in handleNavigation");
    setCurrentActivity(newActivityId);
    setCurrentQuestion(newQuestionId);
  }

}
