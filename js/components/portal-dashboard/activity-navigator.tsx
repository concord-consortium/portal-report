import React from "react";
import { Map } from "immutable";
import ArrowLeftIcon from "../../../img/svg-icons/arrow-left-icon.svg";

import css from "../../../css/portal-dashboard/activity-navigator.less";


interface IProps {
  activities: Map<any, any>;
  currentActivity?: Map<string, any>;
  isSequence: boolean;
  setCurrentActivity: (activityId: string) => void;
  setCurrentQuestion: (questionId: string) => void;
}

export class ActivityNavigator extends React.PureComponent<IProps> {
  render() {
    const { activities, currentActivity, isSequence } = this.props;
    const currentActivityId = currentActivity ? currentActivity.get("id") : activities.first().get("id");
    const currentActivityIndex = activities.toArray().findIndex((a: any) => a.get("id") === currentActivityId);
    const activityTitle = this.setActivityTitle(currentActivityIndex);

    return (
      <div className={`${css.activityNav}  ${!isSequence ? css.standaloneActivity : ""}`} data-cy="activity-navigator">
        { isSequence &&
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
        }
        <div className={css.title} data-cy="activity-title">
          { isSequence && activityTitle }
        </div>
      </div>
    );
  }

  private setActivityTitle = (currentActivityIndex: number) => {
    const { activities, currentActivity } = this.props;
    const activityNumber = `Activity #${currentActivityIndex+1}: `;
    const activityTitle = currentActivity
                          ? currentActivity.get("name")
                          : activities.toArray()[currentActivityIndex].get("name");
    return (
      activityNumber + activityTitle
    );
  }

  private handleNavigation  = (activityIndex: number) => () => {
    const { activities, setCurrentActivity, setCurrentQuestion} = this.props;
    const activitiesArray = activities.toArray();
    if ( activityIndex >= 0 && activityIndex < activitiesArray.length ) {
      const newActivityId = activitiesArray[activityIndex].get("id");
      const newQuestionId = activitiesArray[activityIndex].get("questions").first().get("id");
      setCurrentActivity(newActivityId);
      setCurrentQuestion(newQuestionId);
    }
  }

}
