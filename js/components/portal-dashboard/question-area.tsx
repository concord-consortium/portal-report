import React from "react";
import { Map } from "immutable";
import { QuestionTypes } from "../../util/question-utils";
import LaunchIcon from "../../../img/svg-icons/launch-icon.svg";
import striptags from "striptags";

import css from "../../../css/portal-dashboard/question-area.less";

interface IProps {
  currentQuestion?: Map<string, any>;
  hideQuestion: boolean;
  useMinHeight?: boolean;
}

export class QuestionArea extends React.PureComponent<IProps>{
  render() {
    const { currentQuestion, hideQuestion, useMinHeight } = this.props;
    const teacherEditionButtonClasses = css.teacherEditionButton;
    const teacherEditionBadge = css.teacherEditionBadge;
    const prompt = currentQuestion?.get("prompt");
    const type = currentQuestion?.get("type");
    const scored = currentQuestion?.get("scored");
    const typeText = type && type.replace(/_/gm, ' ');
    const questionType = QuestionTypes.find(qt => qt.type === type && qt.scored === scored);
    const QuestionIcon = questionType?.icon;
    const mcChoices: Map<any,any> = currentQuestion?.get("choices") || [];

    return (
      <div className={`${css.questionArea} ${hideQuestion ? css.hidden : ""}`}>
        <div className={css.questionTypeHeader}>
          <div className={css.leftTitle}>
            <QuestionIcon className={`${css.icon} ${css.questionTypeIcon}`} />
            <span className={css.questionTypeTitle} data-cy="question-title">
              {typeText}
            </span>
          </div>
          <div className={css.rightIcons}>
            <a className={css.externalLinkButton} target="_blank" data-cy="open-activity-button">
              <LaunchIcon className={css.icon} />
            </a>
            <div className={css.teacherEditionIcon}>
              <a className={teacherEditionButtonClasses} target="_blank" data-cy="open-teacher-edition-button">
                <LaunchIcon className={css.icon} />
              </a>
              <div className={teacherEditionBadge}>TE</div>
            </div>
          </div>
        </div>
        <div className={`${css.questionTextArea} ${!useMinHeight ? css.minHeight : ""}`} data-cy="question-content">
          <div className={css.questionText}>
            {prompt ? striptags(prompt.replace(/&nbsp;/g,' ')) : ""}
          </div>
          <div>
            {type === "multiple_choice" && mcChoices.size > 0 ? mcChoices.toArray().map(this.renderMultipleChoiceChoices(mcChoices.toArray().length)):""}
          </div>
        </div>
      </div>
    );
  }

  private renderMultipleChoiceChoices = (numChoices: number) => (choices: Map<string, any>, i: number) => {
    let multipleChoiceContent, multipleChoiceContentClass;
    if (choices.get("correct")) {
      multipleChoiceContentClass = `${css.mcContent} ${css.correct}`;
      multipleChoiceContent = choices.get("content") + " (correct)";
    }
    else {
      multipleChoiceContentClass =  `${css.mcContent}`;
      multipleChoiceContent = choices.get("content");
    }
    return (
      <div className={css.choiceWrapper} key={`choices ${i}`}>
        <div className={`${css.choiceIcon}`}/>
        <div className={`${multipleChoiceContentClass}`}>
          {multipleChoiceContent}
        </div>
      </div>
    );
  }
}
