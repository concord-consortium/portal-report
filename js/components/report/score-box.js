import React, { PureComponent } from "react";
import NumericTextField from "./numeric-text-field";
export default class ScoreBox extends PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    const {score} = this.props;
    return (
      <div className="score" data-cy="question-feedback-score">
        Score:
        <NumericTextField
          className="score-input"
          value={score}
          min={0}
          default={0}
          onChange={this.props.onChange}
          disabled={this.props.disabled}
        />
      </div>
    );
  }
}
