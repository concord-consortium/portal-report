import React, { PureComponent } from "react";

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
    const { answer } = this.props;
    return (
      <div data-cy="openResponseText">
        { answer?.answer }
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
};
