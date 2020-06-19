import React from "react";
import { Map } from "immutable";
import { ProgressLegendContainer } from "./legend-container";
import { QuestionTypes } from "../../util/question-utils";
import CorrectIcon from "../../../img/svg-icons/q-mc-scored-correct-icon.svg";

import css from "../../../css/portal-dashboard/level-viewer.less";

// from level-viewer.less
const questionWidth = 50;
const margin = 20;
const getTotalQuestionsWidth = (numQuestions: number) => Math.max(0, numQuestions * (questionWidth + margin) - margin);

interface IProps {
  activities: Map<any, any>;
  currentActivity?: Map<string, any>;
  currentQuestion?: Map<string, any>;
  toggleCurrentActivity: (activityId: string) => void;
  toggleCurrentQuestion: (questionId: string) => void;
  leftPosition: number;
}

export class LevelViewer extends React.PureComponent<IProps> {
  render() {
    const { activities, leftPosition } = this.props;
    const position = {
      left: leftPosition,
    };
    return (
      <div className={css.levelViewer} data-cy="level-viewer">
        <div className={css.activityButtons} style={position}>
          {
            activities.toArray().map(this.renderActivityButton(activities.toArray().length))
          }
        </div>
        <div className={css.cover} />
        <ProgressLegendContainer />
      </div>
    );
  }

  private renderActivityButton = (totalActivities: number) => (activity: Map<string, any>, idx: number) => {
    if (this.props.currentActivity && activity.get("id") === this.props.currentActivity.get("id")) {
      return this.renderExpandedActivityButton(activity, idx, idx === totalActivities - 1);
    } else {
      return this.renderCollapsedActivityButton(activity, idx);
    }
  }

  private renderCollapsedActivityButton = (activity: Map<string, any>, idx: number) => {
    return (
      <div key={activity.get("id")} className={css.animateLevelButton} data-cy="collapsed-activity-button">
        <div className={css.activityButton}>
          <div className={css.activityInnerButton} onClick={this.handleActivityButtonClick(activity.get("id"))}>
            <div className={css.activityTitle}>
              {idx + 1} {activity.get("name")}
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
      </div>
    );
  }

  private renderExpandedActivityButton = (activity: Map<string, any>, idx: number, isLast: boolean) => {
    const pages: Map<any, any>[] = [];
    activity.get("children").forEach((section: Map<any, any>) => {
      section.get("children").forEach((page: Map<any, any>) => pages.push(page));
    });

    // with an explicit width, we can animate the transition between the small and large sizes
    let totalWidth = 0;
    pages.forEach(p => totalWidth += getTotalQuestionsWidth((p.get("children") as any).size) + margin);
    // add width for the score box
    totalWidth += questionWidth + margin;

    return (
      <div key={activity.get("id")} className={css.animateLevelButton} style={{width: totalWidth}}
          data-cy="expanded-activity-button">
        <div className={`${css.activityButton} ${css.expanded}`}
            onClick={this.handleActivityButtonClick(activity.get("id"))}>
          <div className={css.activityImage} />
          <div className={css.activityTitle}>
            Activity {idx + 1}: {activity.get("name")}
          </div>
        </div>
        <div className={css.pagesContainer}>
          { pages.map(this.renderPage) }
          { this.renderScoreBox() }
        </div>
        { !isLast && <div className={css.blueLine} /> }
      </div>
    );
  }

  private renderPage = (page: Map<string, any>, idx: number) => {
    const questions: Map<any, any>[] = page.get("children");
    // explicit width so we are no larger than the question buttons
    const totalWidth = getTotalQuestionsWidth((questions as any).size);
    if (totalWidth === 0) return;
    return (
      <div className={css.pageWrapper} key={page.get("id")} style={{width: totalWidth}}>
        <div className={css.page}>
            P{idx + 1}: {page.get("name")}
        </div>
        <div className={css.questionsContainer}>
          { questions.map(this.renderQuestion) }
        </div>
        <div className={css.blueLine} />
      </div>
    );
  }

  private renderQuestion = (question: Map<string, any>) => {
    let questionClass = css.question;
    const questionType = QuestionTypes.find(qt => qt.type === question.get("type") && qt.scored === question.get("scored"));
    const QuestionIcon = questionType?.icon;
    if (question.get("id") === this.props.currentQuestion?.get("id")) {
      questionClass += " " + css.active;
    }
    return (
      <div key={question.get("id")} className={questionClass} onClick={this.handleQuestionButtonClick(question.get("id"))}
          data-cy="activity-question-button">
        <div>
            Q{question.get("questionNumber")}
        </div>
        <div>
          <QuestionIcon/>
        </div>
      </div>
    );
  }

  private renderScoreBox = () => {
    return (
      <div className={css.pageWrapper}>
        <div className={css.page + " " + css.noBorder}>
        </div>
        <div className={css.questionsContainer}>
          <div className={css.question} data-cy="activity-question-button">
            <div>
                Score
            </div>
            <div className={css.pagesContainer}>
              <CorrectIcon/>
            </div>
          </div>
        </div>
      </div>
    );
  }

  private handleActivityButtonClick = (activityId: string) => () => {
    this.props.toggleCurrentActivity(activityId);
  }

  private handleQuestionButtonClick = (questionId: string) => () => {
    this.props.toggleCurrentQuestion(questionId);
  }
}
