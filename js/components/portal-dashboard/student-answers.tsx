import React from "react";
import { Map } from "immutable";
import AnswerCompact from "../../containers/portal-dashboard/answer-compact";

import css from "../../../css/portal-dashboard/student-answers.less";

interface IProps {
  activities: Map<any, any>;
  answers: Map<any, any>;
  currentActivity: Map<any, any> | undefined;
  currentQuestion: Map<any, any> | undefined;
  currentStudentId: string | null;
  expandedActivities: Map<any, any>;
  isCompact: boolean;
  questionFeedbacks?: Map<any, any>;
  showFeedbackBadges: boolean;
  students: Map<any, any>;
  studentProgress: Map<any, any>;
  setCurrentActivity: (activityId: string) => void;
  setCurrentQuestion: (questionId: string) => void;
  setCurrentStudent: (studentId: string | null) => void;
}

export class StudentAnswers extends React.PureComponent<IProps> {
  render() {
    const { students, activities, currentActivity, isCompact } = this.props;
    const activitiesList = activities.toList().filter((activity: any) => activity.get("visible"));
    const compactClass = isCompact ? css.compact : "";
    return (
      <div className={css.studentAnswers} data-cy="student-answers">
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

  private renderExpandedActivity = (activity: any, student: any) => {
    const pages: Map<any, any>[] = [];
    activity.get("children").forEach((section: Map<any, any>) => {
      section.get("children").forEach((page: Map<any, any>) => pages.push(page));
    });
    // TODO: do we need to filter hidden questions?
    // const visibleQuestions = activity.get("questions", []).filter((q: any) => q.get("visible"));
    return (
      <div className={css.activityAnswers} key={activity.get("id")}>
        { pages.map((page: any) => this.renderActivityPage(activity, page, student)) }
        { this.renderScore(activity, student) }
      </div>
    );
  }

  private renderActivityPage = (activity: any, page: any, student: any) => {
    const currentActivityId = this.props.currentActivity?.get("id");
    const currentQuestionId = this.props.currentQuestion?.get("id");
    const currentStudentId = this.props.currentStudentId;
    return (
      <div className={css.activityPage} key={page.get("id")}>
        { page.get("children").map((question: any) => {
            const questionId = question.get("id");
            const studentId = student.get("id");
            const selected = (currentActivityId === activity.get("id") &&
                              currentQuestionId === questionId &&
                              currentStudentId === studentId);
            // TODO: FEEDBACK
            // get questionFeedbacks and showFeedbackBadges from props
            // if showFeedbackBadges is true,
            // search questionFeedbacks for entry that has student id and question id
            // that match studentId and questionId and then
            // optionally display feedback icon component if we found matching feedback
            return (
              <AnswerCompact
                key={questionId}
                question={question}
                student={student}
                onAnswerSelect={this.handleAnswerSelect(currentActivityId, questionId, student.get("id"))}
                selected={selected}
               />
            );
          })
        }
      </div>
    );
  }

  private handleAnswerSelect = (activityId: string, questionId: string, studentId: string) => () => {
    const currentActivityId = this.props.currentActivity?.get("id");
    const currentQuestionId = this.props.currentQuestion?.get("id");
    const currentStudentId = this.props.currentStudentId;
    const unselectStudent = currentActivityId === activityId && currentQuestionId === questionId && currentStudentId === studentId;
    this.props.setCurrentActivity(activityId);
    this.props.setCurrentQuestion(questionId);
    this.props.setCurrentStudent(unselectStudent? null : studentId);
  }

  private renderScore = (activity: any, student: any) => {
    const { answers } = this.props;
    const scoredQuestions = activity.get("questions").filter((q: any) =>
      q.get("visible") && q.get("type") === "multiple_choice" && q.get("scored"),
    );
    const questionsWithCorrectAnswer = scoredQuestions.filter(
      (question: any) => answers.getIn([question.get("id"), student.get("id"), "correct"])
    );
    const correctQuestionCount = questionsWithCorrectAnswer.count();
    const scoredQuestionCount = scoredQuestions.count();
    const scoreClass = correctQuestionCount === scoredQuestionCount && scoredQuestionCount > 0 ? css.perfect : "";
    return (
      <div className={css.scoreHolder}>
        <div className={`${css.score} ${scoreClass}`}>
          { `${correctQuestionCount}/${scoredQuestionCount}` }
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
