import React, { PureComponent } from "react";
import { Map, List } from "immutable";

import { InteractiveStateHistoryRangeInput } from "../portal-dashboard/interactive-state-history-range-input";

import css from "../../../css/dashboard/open-response-answer.less";

export default class OpenResponseAnswer extends PureComponent {
  renderIcon() {
    return (
      <div className={css.icon} data-cy="openResponseIcon">
        <i className={"icomoon-file-text"} />
      </div>
    );
  }

  renderFullAnswer() {
    const { answer, interactiveStateHistory, interactiveStateHistoryId, setInteractiveStateHistoryId } = this.props;
    return (
      <div data-cy="openResponseText">
        { answer.get("answer") }
        {interactiveStateHistory && setInteractiveStateHistoryId &&
          <InteractiveStateHistoryRangeInput
            answer={answer}
            interactiveStateHistory={interactiveStateHistory}
            interactiveStateHistoryId={interactiveStateHistoryId}
            setInteractiveStateHistoryId={setInteractiveStateHistoryId}
          />
        }
      </div>
    );
  }

  render() {
    const { showFullAnswer } = this.props;
    return (
      <div className={css.openResponseAnswer}>
        { showFullAnswer ? this.renderFullAnswer() : this.renderIcon() }
      </div>
    );
  }
}

OpenResponseAnswer.defaultProps = {
  answer: Map(),
  showFullAnswer: false,
  interactiveStateHistory: List(),
  interactiveStateId: undefined,
  setInteractiveStateId: () => {},
};
