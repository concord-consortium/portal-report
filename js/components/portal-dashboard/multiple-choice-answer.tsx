import React, { PureComponent } from "react";
import { Map } from "immutable";
import Choice from "./choice";

import css from "../../../css/portal-dashboard/multiple-choice-answer.less";

const CORRECT_ICON = "icomoon-checkmark " + css.correct;
const INCORRECT_ICON = "icomoon-cross " + css.incorrect;
const SELECTED_ICON = "icomoon-checkmark2";

interface IProps {
  answer: Map<any, any>;
  question: Map<any, any>;
  showFullAnswer: boolean;
}

export default class MultipleChoiceAnswer extends PureComponent<IProps> {
  renderIcon() {
    const { answer, question } = this.props;
    let icon;
    if (!question.get("scored")) {
      // Undefined as there's no correct or incorrect choice defined.
      icon = SELECTED_ICON;
    } else {
      icon = answer.get("correct") ? CORRECT_ICON : INCORRECT_ICON;
    }
    return (
      <div className={css.icon} data-cy="multipleChoiceIcon">
        <i className={icon} />
      </div>
    );
  }

  renderFullAnswer() {
    const { question, answer } = this.props;
    const choices = question.get("choices");
    const studentChoices = answer.get("selectedChoices");
    return (
      <div data-cy="multiple-choice-answers">
        {
          choices.map((choice: any) =>
            <Choice key={choice.get("id")} choice={choice} correctAnswerDefined={question.get("scored")}
              selected={studentChoices.some(studentChoice => studentChoice.get("id") === choice.get("id"))}
            />
          )
        }
      </div>
    );
  }

  render() {
    const { showFullAnswer } = this.props;
    return (
      <div className={css.multipleChoiceAnswer}>
        { showFullAnswer ? this.renderFullAnswer() : this.renderIcon() }
      </div>
    );
  }
}
