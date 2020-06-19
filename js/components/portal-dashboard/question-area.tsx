/* eslint-disable no-console */
import React from "react";
import { Map } from "immutable";
import { QuestionTypes } from "../../util/question-utils";

import css from "../../../css/portal-dashboard/question-area.less";

interface IProps {
  currentQuestion?: Map<string, any>;
  style: any;
}

export class QuestionArea extends React.PureComponent<IProps>{
  render() {
    const { currentQuestion, style } = this.props;
    const teacherEditionButtonClasses = `${css.teacherEditionButton}`;
    const teacherEditionBadge = `${css.teacherEditionBadge}`;
    const prompt = currentQuestion ? currentQuestion.get("prompt") : "";
    const type = currentQuestion ? currentQuestion.get("type") : "";
    const scored = currentQuestion ? currentQuestion.get("scored") : "";
    const typeText = type && type.replace(/_/gm, ' ');
    const questionType = QuestionTypes.find(qt => qt.type === type && qt.scored === scored);
    const QuestionIcon = questionType?.icon;
    return (
      <div className={css.questionArea} style={style}>
        < div className={`${css.questionTypeHeader}`}>
          <div className={`${css.leftTitle}`} >
            <QuestionIcon className={`${css.icon} ${css.questionTypeIcon}`} />
            <span className={css.questionTypeTitle} data-cy="question-title">
              {typeText}
            </span>
          </div>
          <div className={`${css.rightIcons}`}>
            <a className={`${css.externalLinkButton}`} target="_blank" data-cy="open-activity-button" >
              <svg className={`${css.icon}`}>
                <use xlinkHref="#external-link" />
              </svg>
            </a>
            <div className={css.teacherEditionIcon} >
              <a className={teacherEditionButtonClasses} target="_blank" data-cy="open-teacher-edition-button">
                <svg className={`${css.icon}`}>
                  <use xlinkHref="#external-link" />
                </svg>
              </a>
              <div className={teacherEditionBadge}>TE</div>
            </div>
          </div>
        </div >
        <div className={css.questionTextArea} data-cy="question-text">
          <div className={css.questionText}>
            {prompt ? prompt.replace(/<[^>]*>?/gm, '') : ""}
          </div>
        </div>
      </div>
    );
  }
}
