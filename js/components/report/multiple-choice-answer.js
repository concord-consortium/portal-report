import React, { PureComponent } from "react";

export default class MultipleChoiceAnswer extends PureComponent {
  render() {
    const { answer } = this.props;
    return (
      <div>
        {answer.get("selectedChoices").map(c => c.get("content")).join(", ")}
      </div>
    );
  }
}
