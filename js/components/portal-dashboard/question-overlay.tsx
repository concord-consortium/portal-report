import React from "react";
import { Map } from "immutable";

import css from "../../../css/portal-dashboard/question-overlay.less";

interface IProps {
  currentQuestion?: Map<string, any>;
}

export class QuestionOverlay extends React.PureComponent<IProps> {
  render() {
    const { currentQuestion } = this.props;
    let wrapperClass = css.questionOverlay;
    if (currentQuestion) {
      wrapperClass += " " + css.visible;
    }
    return (
      <div className={wrapperClass} data-cy="question-overlay">
        {
          currentQuestion && this.renderQuestionDetails(currentQuestion)
        }
      </div>
    );
  }

  private renderQuestionDetails = (question: Map<string, any>) => {
    return (
      <React.Fragment>
        <div className={css.header}>
          <svg className={css.icon}>
            <use xlinkHref="#question-popout"/>
          </svg>
          <div>Question Detail View</div>
        </div>
        <div className={css.titleWrapper}>
          <div className={css.title}>
            Question #{ question.get("questionNumber") }
          </div>
        </div>
      </React.Fragment>
    );
  }
}
