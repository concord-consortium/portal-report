import React, { PureComponent } from "react";

export default class MultipleChoiceAnswer extends PureComponent {
  render() {
    const { answer } = this.props;
    return (
      <div>
        {answer?.selectedChoices.map(c => c?.content).join(", ")}
      </div>
    );
  }
}
