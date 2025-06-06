import React, { FunctionComponent, SVGProps } from "react";
import { List, Map } from "immutable";
import { ProgressLegendContainer } from "./legend-container";
import { getQuestionIcon } from "../../util/question-utils";
import MCScoreIcon from "../../../img/svg-icons/mc-score-icon.svg";
import ManualScoreIcon from "../../../img/svg-icons/manual-score-icon.svg";
import NoScoreIcon from "../../../img/svg-icons/no-score-icon.svg";
import RubricScoreIcon from "../../../img/svg-icons/rubric-score-icon.svg";
import LaunchIcon from "../../../img/svg-icons/launch-icon.svg";
import ExpandIcon from "../../../img/svg-icons/expand-more-icon.svg";
import LinesEllipsis from "react-lines-ellipsis";
import ReportItemIframe from "./report-item-iframe";
import { TrackEventFunction } from "../../actions";
import { ScoreType, ScoringSettings } from "../../util/scoring";
import { MANUAL_SCORE, NO_SCORE, RUBRIC_SCORE, AUTOMATIC_SCORE } from "../../util/scoring-constants";

import css from "../../../css/portal-dashboard/level-viewer.less";

const kMaxActivityColors = 5;
const activityColorClasses: string[] = [css.firstColor, css.secondColor, css.thirdColor, css.fourthColor, css.fifthColor];
// from level-viewer.less
const progressWidth = 117;
const questionWidth = 50;
const margin = 20;
const getTotalQuestionsWidth = (numQuestions: number) => Math.max(0, numQuestions * (questionWidth + margin) - margin);

export const scoreTypeLabels: Record<ScoreType, React.ReactNode> = {
  [MANUAL_SCORE]: <>Manual<br/>Score</>,
  [NO_SCORE]: <>No<br/>Score</>,
  [RUBRIC_SCORE]: <>Rubric<br/>Score</>,
  [AUTOMATIC_SCORE]: <>MC Qs<br/>Score</>
};
export const scoreTypeIcons: Record<ScoreType, FunctionComponent<SVGProps<SVGSVGElement>>> = {
  [MANUAL_SCORE]: ManualScoreIcon,
  [NO_SCORE]: NoScoreIcon,
  [RUBRIC_SCORE]: RubricScoreIcon,
  [AUTOMATIC_SCORE]: MCScoreIcon
};

interface IProps {
  activities: List<any>;
  currentActivity?: Map<string, any>;
  currentQuestion?: Map<string, any>;
  hideFeedbackBadges: boolean;
  leftPosition: number;
  studentProgress: any;
  toggleCurrentActivity: (activityId: string) => void;
  toggleCurrentQuestion: (questionId: string) => void;
  trackEvent: TrackEventFunction;
  scoringSettings: ScoringSettings;
  jumpToActivityFeedback: () => void;
}

export class LevelViewer extends React.PureComponent<IProps> {
  render() {
    const { activities, leftPosition, hideFeedbackBadges } = this.props;
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
        <ProgressLegendContainer hideFeedbackBadges={hideFeedbackBadges}/>
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
            <div className={css.activityTitle} title={`${idx + 1} ${activity.get("name")}`}>
              <LinesEllipsis
                text={`${idx + 1}: ${activity.get("name")}`}
                maxLine="3"
                ellipsis="..."
                basedOn="letters"
              />
            </div>
            <div className={`${css.activityImage} ${this.activityColorClass(idx)}`}>
              <ExpandIcon />
            </div>
          </div>
          <div className={css.externalLink}>
            <a className={css.externalLinkButton} data-cy="external-link-button"
              href={activity.get("previewUrl")} target="_blank">
              <LaunchIcon className={css.icon} />
            </a>
          </div>
          { this.renderProgressBar(activity.get("id")) }
        </div>
      </div>
    );
  }

  private renderProgressBar = (activityId: string) => {
    const { studentProgress } = this.props;
    const total = studentProgress.size;
    let complete = 0;
    let started = 0;
    studentProgress.forEach((student: any) => {
      const progress = student.get(activityId);
      if (progress === 1) {
        complete++;
        started++;
      } else if (progress > 0) {
        started++;
      }
    });
    const completedWidth = {
      width: complete / total * progressWidth,
    };
    const startedWidth = {
      width: started / total * progressWidth,
    };
    return (
      <div className={css.progressBar}>
        <div className={css.started} style={startedWidth} />
        <div className={css.completed} style={completedWidth} />
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
          <div className={`${css.activityImage} ${this.activityColorClass(idx)}`}>
            <ExpandIcon />
          </div>
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
        <div className={css.page} title={`P${idx + 1}: ${page.get("name")}`}>
          <LinesEllipsis
            text={`P${idx + 1}: ${page.get("name")}`}
            maxLine="2"
            ellipsis="..."
            basedOn="letters"
          />
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
    const QuestionIcon = getQuestionIcon(question);
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
          <QuestionIcon className={css.icon} />
          { question.get("reportItemUrl") && <ReportItemIframe question={question} view="hidden" /> }
        </div>
      </div>
    );
  }

  private renderScoreBox = () => {
    const {scoringSettings: { scoreType }} = this.props;
    const Icon = scoreTypeIcons[scoreType];

    return (
      <div className={css.pageWrapper}>
        <div className={css.page + " " + css.noBorder}>
        </div>
        <div className={css.questionsContainer}>
          <div className={`${css.question} ${css.score}`} data-cy="activity-score" onClick={this.handleScoreBoxClicked}>
            <div className={css.label}>
              {scoreTypeLabels[scoreType]}
            </div>
            <div className={css.pagesContainer}>
              <Icon className={`${css.icon} ${css.score}`} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  private handleActivityButtonClick = (activityId: string) => () => {
    this.props.toggleCurrentQuestion(this.props.currentQuestion?.get("id"));
    this.props.toggleCurrentActivity(activityId);

    const activity = this.props.activities && this.props.activities.find(a => a.get("id") === activityId);
    this.props.trackEvent("Portal-Dashboard", "LevelViewerToggleActivity", {label: activityId, parameters: {
      show: this.props.currentActivity?.get("id") !== activityId,
      activityName: activity && activity.get("name")
    }});
  }

  private handleQuestionButtonClick = (questionId: string) => () => {
    this.props.toggleCurrentQuestion(questionId);

    this.props.trackEvent("Portal-Dashboard", "LevelViewerToggleQuestion", {label: questionId, parameters: {
      activityId: this.props.currentActivity && this.props.currentActivity.get("id"),
      show: this.props.currentQuestion?.get("id") !== questionId
    }});
  }

  private activityColorClass = (activityNumber: number) => {
    const colorNum = activityNumber % kMaxActivityColors;
    return colorNum < activityColorClasses.length ? activityColorClasses[colorNum] : "";
  }

  private handleScoreBoxClicked = () => {
    const activityId = this.props.currentActivity && this.props.currentActivity.get("id");
    this.props.trackEvent("Portal-Dashboard", "ClickScoreDashboard", {label: activityId});
    this.props.jumpToActivityFeedback();
  }
}
