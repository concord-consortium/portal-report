import React, { PureComponent } from "react"; // eslint-disable-line
import { RadioGroup, Radio } from "react-radio-group";
import ReactTooltip from "react-tooltip";
import "../../../css/report/feedback-options.less";
import "../../../css/report/tooltip.less";
import NumericTextField from "./numeric-text-field";
import {
  MANUAL_SCORE,
  MANUAL_SCORE_L,
  AUTOMATIC_SCORE,
  AUTOMATIC_SCORE_L,
  RUBRIC_SCORE,
  RUBRIC_SCORE_L,
  MAX_SCORE_DEFAULT,
} from "../../util/scoring-constants";

export default class FeedbackOptionsView extends PureComponent {
  renderMaxScore() {
    const {scoreType, maxScore, setMaxScore, scoreEnabled} = this.props;
    if (scoreType === MANUAL_SCORE) {
      return (
        <span>
          <label className="max-score" data-cy="max-score">Max. Score</label>
          <NumericTextField
            className="max-score-input"
            value={maxScore}
            min={1}
            default={MAX_SCORE_DEFAULT}
            onChange={setMaxScore}
            disabled={!scoreEnabled}
          />
        </span>
      );
    }
    return (
      <span>
        <label className="max-score disabled" data-cy="max-score-disabled">Max. Score</label>
        <input className="max-score-input disabled" disabled value={maxScore} />
      </span>
    );
  }

  renderToolTip(id, text) {
    return <ReactTooltip id={id} place="top" type="dark"delayShow={500}> {text} </ReactTooltip>;
  }

  renderRubricSelectBox() {
    const {
      rubricAvailable,
      allowAutoScoring,
      enableRubric,
      useRubric,
    } = this.props;
    const showRubricScoreOptions = rubricAvailable && allowAutoScoring;
    if (!showRubricScoreOptions) { return null; }
    return (
      <div>
        <input id="rubricEnabled"
          type="checkbox"
          checked={useRubric}
          disabled={!rubricAvailable}
          onChange={enableRubric}
          data-cy="rubric-checkbox"
        />
        <label
          disabled={!rubricAvailable}
          className={!rubricAvailable
            ? "disabled"
            : ""}
          htmlFor="rubricEnabled">
          Use rubric</label>
        <br />
      </div>
    );
  }

  renderAutoScoreGroups() {
    const {
      changeScoreType,
      scoreType,
      useRubric,
      rubricAvailable,
    } = this.props;

    return (
      <RadioGroup
        name="scoreType"
        selectedValue={scoreType}
        onChange={changeScoreType}
      >
        <div>
          <Radio value={MANUAL_SCORE} data-cy="manual-score-option"/>
          <span className="tooltip" data-tip data-for="MANUAL_SCORE">
            {MANUAL_SCORE_L}
          </span>
          { this.renderMaxScore() }
        </div>

        <div>
          <Radio value={AUTOMATIC_SCORE} data-cy="automatic-score-option"/>
          <span className="tooltip" data-tip data-for="AUTOMATIC_SCORE">
            {AUTOMATIC_SCORE_L}
          </span>
        </div>
        { rubricAvailable
          ? <div className={useRubric ? "" : "disabled"}>
            <Radio value={RUBRIC_SCORE} disabled={!useRubric} data-cy="rubric-score-option"/>
            <span className="tooltip" data-tip data-for="RUBRIC_SCORE">
              {RUBRIC_SCORE_L}
            </span>
          </div>
          : null
        }

        { this.renderToolTip("NO_SCORE", "Provide your own activity level score.") }
        { this.renderToolTip("MANUAL_SCORE", "No activity level score.") }
        { this.renderToolTip("RUBRIC_SCORE", "Scores come from the rubric.") }
        { this.renderToolTip("AUTOMATIC_SCORE", "Sum scores from individual questions.") }
      </RadioGroup>
    );
  }

  renderScoreOptions() {
    const {
      scoreEnabled,
      allowAutoScoring,
    } = this.props;

    const scoreClassName = scoreEnabled
      ? "enabled"
      : "disabled";

    return (
      <div className="score-options">
        <div className={scoreClassName} style={{marginLeft: "1em"}}>
          { allowAutoScoring ? this.renderAutoScoreGroups() : this.renderMaxScore() }
        </div>
      </div>
    );
  }

  render() {
    const {
      scoreEnabled,
      enableText,
      toggleScoreEnabled,
      showText,
    } = this.props;

    const writtenFeedbackLabel = "Provide written feedback";
    const giveScoreLabel = "Give Score";

    return (
      <div className="feedback-options">
        <div className="main-options">
          {this.renderRubricSelectBox() }
          <input
            id="feedbackEnabled"
            type="checkbox"
            checked={showText || false}
            onChange={enableText}
          />
          <label htmlFor="feedbackEnabled">{writtenFeedbackLabel}</label>
          <br />
          <input
            id="giveScore"
            name="giveScore"
            type="checkbox"
            checked={scoreEnabled || false}
            onChange={toggleScoreEnabled}
          />
          <label htmlFor="giveScore">{giveScoreLabel}</label>
          <br />
          { this.renderScoreOptions() }
        </div>

      </div>
    );
  }
}
