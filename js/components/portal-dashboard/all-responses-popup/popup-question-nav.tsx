import React from "react";
import { Map } from "immutable";
import { QuestionNavigator } from "../question-navigator";
import css from "../../../../css/portal-dashboard/all-responses-popup/popup-question-nav.less";


interface IProps {
  currentQuestion?: Map<string, any>;
  questions?: Map<string, any>;
  sortedQuestionIds?: string[];
  toggleCurrentQuestion: (questionId: string) => void;
  setCurrentActivity: (activityId: string) => void;
}
export class PopupQuestionNav extends React.PureComponent<IProps>{
  render() {
    const cssToUse = css;
    const { currentQuestion, questions, sortedQuestionIds, toggleCurrentQuestion, setCurrentActivity } = this.props;
    return (
      <div className={`${css.questionArea} ${css.column}`}>
        <div className={`${css.popupQuestionNavigator}`} data-cy="questionNav">
          <QuestionNavigator cssToUse={cssToUse}
            currentQuestion={currentQuestion}
            questions={questions}
            sortedQuestionIds={sortedQuestionIds}
            toggleCurrentQuestion={toggleCurrentQuestion}
            setCurrentActivity={setCurrentActivity} />
        </div>
        <div className={`${css.popupQuestionDiv}`} >
          {this.renderQuestionTypeHeader()}
          <div className={css.questionText} data-cy="question-text">
            Question text here
          </div>
        </div>
      </div>
    );
  }

  private renderQuestionTypeHeader() {
    return (
      <div className={`${css.questionTypeHeader}`}>
        <div className={`${css.leftTitle}`} >
          <svg className={`${css.icon} ${css.questionTypeIcon}`}>
            <use xlinkHref="#text-question" />
          </svg>
          <span className={css.questionTypeTitle} data-cy="question-title">Question Type</span>
        </div>
        <div className={`${css.rightIcons}`}>
          <a className={`${css.externalLinkButton}`} target="_blank" data-cy="open-activity-button">
            <svg className={`${css.icon}`}>
              <use xlinkHref="#external-link" />
            </svg>
          </a>
          <div className={css.teacherEditionIcon} >
            <a className={`${css.teacherEditionButton}`} target="_blank" data-cy="open-teacher-edition-button">
              <svg className={`${css.icon}`}>
                <use xlinkHref="#external-link" />
              </svg>
            </a>
            <div className={`${css.teacherEditionBadge}`}>TE</div>
          </div>
        </div>
      </div>
    );
  }
}
