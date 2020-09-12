import React from "react";
import AnswerCompact from "../../containers/portal-dashboard/answer-compact";

import css from "../../../css/portal-dashboard/student-answers.less";

interface IProps {
  activities: any;
  currentActivity: any;
  expandedActivities: any;
  isCompact: boolean;
  students: any;
  studentProgress: any;
  setCurrentActivity: (activityId: string) => void;
  setCurrentQuestion: (questionId: string) => void;
}

export class StudentAnswers extends React.PureComponent<IProps> {
  private studentAnswersRef: HTMLElement | null;

  render() {
    const { students, activities, currentActivity, isCompact } = this.props;
    const activitiesList = activities.toList().filter((activity: any) => activity.get("visible"));
    const compactClass = isCompact ? css.compact : "";
    return (
      <div className={css.studentAnswers} ref={elt => this.studentAnswersRef = elt} data-cy="student-answers" >
      {
        students.map((s: any) => {
          return (
            <div key={s.get("id")} className={`${css.studentAnswersRow} ${compactClass}`} data-cy="student-answers-row">
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

  public getStudentAnswersRef = () => {
    return this.studentAnswersRef;
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
    const activityId = this.props.currentActivity.get("id");
    return (
      <div className={css.activityPage} key={page.get("id")}>
        { page.get("children").map((question: any) => {
            const questionId = question.get("id");
            return (
              <AnswerCompact
                key={questionId}
                question={question}
                student={student}
                onAnswerSelect={this.handleAnswerSelect(activityId, questionId)}
               />
            );
          })
        }
      </div>
    );
  }

  private handleAnswerSelect = (activityId: string, questionId: string) => () => {
    this.props.setCurrentActivity(activityId);
    this.props.setCurrentQuestion(questionId);
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
        { (progress > 0 && progress < 1) &&
            <div><span className={css.numAnswered}>{numAnswered}</span><span>/{numQuestions}</span></div>
        }
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
