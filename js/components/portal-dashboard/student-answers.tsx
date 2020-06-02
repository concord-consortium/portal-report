import React from "react";
import Answer from "../../containers/portal-dashboard/answer";

import css from "../../../css/portal-dashboard/student-answers.less";

interface IProps {
  activities: any;
  currentActivity: any;
  expandedActivities: any;
  students: any;
  studentProgress: any;
}

export class StudentAnswers extends React.PureComponent<IProps> {
  render() {
    const { students, activities, currentActivity } = this.props;
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
                  return (
                    (currentActivity && a.get("id") === currentActivity.get("id"))
                    ? this.renderExpandedActivity(a, s)
                    : this.renderProgress(a, s)
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

  private renderExpandedActivity = (activity: any, student: any) => {
    const pages: Map<any, any>[] = [];
    activity.get("children").forEach((section: Map<any, any>) => {
      section.get("children").forEach((page: Map<any, any>) => pages.push(page));
    });
    // TODO: do we need to filter hidden questions?
    // const visibleQuestions = activity.get("questions", []).filter((q: any) => q.get("visible"));
    return (
      <div className={css.activityAnswers} key={activity.get("id")}>
        { pages.map((page: any) => this.renderActivityPage(page, student)) }
        { this.renderScore(activity, student) }
      </div>
    );
  }

  private renderActivityPage = (page: any, student: any) => {
    return (
      <div className={css.activityPage} key={page.get("id")}>
        { page.get("children").map((question: any) => {
            return (
              <Answer key={question.get("id")} question={question} student={student} />
            );
          })
        }
      </div>
    );
  }

  private renderScore = (activity: any, student: any) => {
    const { studentProgress } = this.props;
    const numQuestions = activity.get("questions").size;
    const progress = studentProgress.getIn([student.get("id"), activity.get("id")]);
    const numAnswered = Math.round(progress * numQuestions);
    const scoreClass = progress === 1 ? css.complete : "";
    return (
      <div className={css.scoreHolder}>
        <div className={`${css.score} ${scoreClass}`}>
          { `${numAnswered}/${numQuestions}` }
        </div>
      </div>
    );
  }

  private renderProgress = (activity: any, student: any) => {
    const { studentProgress } = this.props;
    const numQuestions = activity.get("questions").size;
    const progress = studentProgress.getIn([student.get("id"), activity.get("id")]);
    const numAnswered = Math.round(progress * numQuestions);
    const progressClass = progress > 0 ? css.progress : "";
    return (
      <div className={`${css.activityProgress} ${progressClass}`} key={activity.get("id")}>
        { this.renderProgressIcon(progress) }
        { (progress > 0 && progress < 1) && `${numAnswered}/${numQuestions}` }
      </div>
    );
  }

  private renderProgressIcon = (progress: number) => {
    const cssClass = progress > 0
                      ? progress === 1 ? css.completed : css.inProgress
                      : "";
    return (
      <div className={`${css.progressIcon} ${cssClass}`}/>
    );
  }
}
