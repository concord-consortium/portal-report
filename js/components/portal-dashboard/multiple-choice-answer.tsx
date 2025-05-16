import React, { PureComponent } from "react";
import { Map, List } from "immutable";
import MultipleChoiceChoices from "./multiple-choice-choices";

import css from "../../../css/portal-dashboard/multiple-choice-answer.less";

const CORRECT_ICON = "icomoon-checkmark " + css.correct;
const INCORRECT_ICON = "icomoon-cross " + css.incorrect;
const SELECTED_ICON = "icomoon-checkmark2";

interface IProps {
  // For individual student response
  answer?: Map<string, any>;
  showFullAnswer?: boolean;
  // For aggregate class response
  answers?: Map<string, any>;
  students?: Map<string, any>;
  // Common
  inQuestionDetailsPanel?: boolean;
  question: Map<string, any>;
}

export default class MultipleChoiceAnswer extends PureComponent<IProps> {
  renderIcon() {
    const { answer, question } = this.props;
    if (!answer) return null;

    const icon = !question.get("scored") // Undefined as there's no correct or incorrect choice defined.
                  ? SELECTED_ICON
                  : answer.get("correct") ? CORRECT_ICON : INCORRECT_ICON;

    return (
      <div className={css.icon} data-cy="multipleChoiceIcon">
        <i className={icon} />
      </div>
    );
  }

  renderFullAnswer() {
    const { question, answer, answers, students, inQuestionDetailsPanel } = this.props;
    const choices = question.get("choices") || List();

    // Aggregated class responses
    if (answers && students) {
      return (
        <MultipleChoiceChoices
          answers={answers}
          choices={choices}
          inQuestionDetailsPanel={inQuestionDetailsPanel}
          question={question}
          showStats={true}
          students={students}
        />
      );
    }

    // Individual student response
    if (answer) {
      return (
        <MultipleChoiceChoices
          choices={choices}
          inQuestionDetailsPanel={inQuestionDetailsPanel}
          question={question}
          studentAnswer={answer}
          showStats={false}
        />
      );
    }

    return null;
  }

  render() {
    const { showFullAnswer = true, answers, students } = this.props;

    if (answers && students) {
      return (
        <div className={css.multipleChoiceAnswer}>
          {this.renderFullAnswer()}
        </div>
      );
    }

    return (
      <div className={css.multipleChoiceAnswer}>
        { showFullAnswer ? this.renderFullAnswer() : this.renderIcon() }
      </div>
    );
  }
}
