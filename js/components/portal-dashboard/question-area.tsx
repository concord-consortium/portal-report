/* eslint-disable no-console */
import React from "react";
import { Map } from "immutable";
import { QuestionTypes } from "../../util/question-utils";
import LaunchIcon from "../../../img/svg-icons/launch-icon.svg";

import css from "../../../css/portal-dashboard/question-area.less";

interface IProps {
  currentQuestion?: Map<string, any>;
  hideQuestion: boolean;
}

export class QuestionArea extends React.PureComponent<IProps>{
  render() {
    const { currentQuestion, hideQuestion } = this.props;
    const teacherEditionButtonClasses = `${css.teacherEditionButton}`;
    const teacherEditionBadge = `${css.teacherEditionBadge}`;
    const prompt = currentQuestion?.get("prompt");
    const type = currentQuestion?.get("type");
    const scored = currentQuestion?.get("scored");
    const typeText = type && type.replace(/_/gm, ' ');
    const questionType = QuestionTypes.find(qt => qt.type === type && qt.scored === scored);
    const QuestionIcon = questionType?.icon;
    const questionAreaClass = hideQuestion? `${css.hidden}`:"";

    return (
      <div className={questionAreaClass}>
        < div className={`${css.questionTypeHeader}`}>
          <div className={`${css.leftTitle}`} >
            <QuestionIcon className={`${css.icon} ${css.questionTypeIcon}`} />
            <span className={css.questionTypeTitle} data-cy="question-title">
              {typeText}
            </span>
          </div>
          <div className={`${css.rightIcons}`}>
            <a className={`${css.externalLinkButton}`} target="_blank" data-cy="open-activity-button" >
              <LaunchIcon className={css.icon} />
            </a>
            <div className={css.teacherEditionIcon} >
              <a className={teacherEditionButtonClasses} target="_blank" data-cy="open-teacher-edition-button">
                <LaunchIcon className={css.icon} />
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
