import React, { PureComponent } from "react";
import CorrectIcon from "../../../img/svg-icons/q-mc-scored-correct-icon.svg";
import IncorrectIcon from "../../../img/svg-icons/q-mc-scored-incorrect-icon.svg";
import CompleteIcon from "../../../img/svg-icons/q-mc-nonscored-completed-icon.svg";

import css from "../../../css/portal-dashboard/multiple-choice-answer.less";

interface IProps {
  choice: any;
  correctAnswerDefined: any;
  selected: any;
}
export default class Choice extends PureComponent <IProps>{
  get icon() {
    const { choice, selected, correctAnswerDefined } = this.props;
    const isCorrect = choice.get("correct");
    if (correctAnswerDefined && selected && isCorrect) {
      return <CorrectIcon />;
    } else if (correctAnswerDefined && selected && !isCorrect) {
      return <IncorrectIcon />;
    } else if (selected) {
      return <CompleteIcon />;
    }
    return <div className={css.noAnswer}></div>
    ;
  }

  render() {
    const { choice } = this.props;
    return (
      <div className={css.choice}>
        {this.icon}
        <div className={css.choiceContent}>
          <div className={css.choiceText} data-cy="multiple-choice-choice-text">
            { choice.get("content") }
          </div>
        </div>
      </div>
    );
  }
}
