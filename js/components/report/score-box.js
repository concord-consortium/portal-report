import React, { PureComponent } from "react";
import NumericTextField from "./numeric-text-field";
export default class ScoreBox extends PureComponent {
  constructor(props) {
    super(props);
  }

  // The score property is a little confusing here
  // when the ScoreBox is disabled changes to the score property will be shown
  // when it is not disable, the score property just initializes the text field.
  // If you need the score to update you'll need to recreate the ScoreBox or switch it
  // to disabled and then enabled.
  renderScore(props) {
    const {score, onChange, disabled } = props;
    if (disabled) {
      return <input
        className="score-input"
        value={score}
        disabled="true"
      />;
    } else {
      return <NumericTextField
        className="score-input"
        initialValue={score}
        min={0}
        onChange={onChange}
        disabled={disabled}
      />;
    }
  }

  render() {
    return (
      <div className="score" data-cy="question-feedback-score">
        Score:
        {this.renderScore(this.props)}
      </div>
    );
  }
}
