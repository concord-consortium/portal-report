import React from "react";

import css from "../../../css/portal-dashboard/student-answers.less";

interface IProps {
  activities: any;
  students: any;
  studentProgress: any;
}

export class StudentAnswers extends React.PureComponent<IProps> {
  render() {
    const { students, activities, studentProgress } = this.props;
    const activitiesList = activities.toList().filter((activity: any) => activity.get("visible"));
    return (
      <div className={css.studentAnswers}>
      {
        students.map((s: any) => {
          return (
            <div
              key={s.get("id")}
              className={css.studentAnswersRow} data-cy="studentAnswersRow">
              {
                activitiesList.map((a: any) => {
                  const numQuestions = a.get("questions").size;
                  const progress = studentProgress.getIn([s.get("id"), a.get("id")]);
                  const numAnswered = Math.round(progress * numQuestions);
                  const progressClass = progress > 0 ? css.progress : "";
                  return (
                    <div className={`${css.activityAnswers} ${progressClass}`} key={a.get("id")}>
                      {this.renderProgress(progress)}
                      {(progress > 0 && progress < 1) && `${numAnswered}/${numQuestions}`}
                    </div>
                  );
                })
              }
            </div>
          );
        })
      }
      </div>
    );
  }

  private renderProgress = (progress: number) => {
    const cssClass = progress > 0
                      ? progress === 1 ? css.completed : css.inProgress
                      : "";
    return (
      <div className={`${css.progressIcon} ${cssClass}`}/>
    );
  }
}
