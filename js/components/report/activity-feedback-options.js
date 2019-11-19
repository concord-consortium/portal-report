import React, { PureComponent } from "react"; // eslint-disable-line
import FeedbackOptionsView from "./feedback-options-view";

import {
  NO_SCORE,
  MANUAL_SCORE,
  isAutoScoring,
} from "../../util/scoring-constants";

export default class ActivityFeedbackOptions extends PureComponent {
  constructor(props) {
    super(props);
    this.state = { lastScoreType: null };
    this.enableText = this.enableText.bind(this);
    this.enableRubric = this.enableRubric.bind(this);
    this.setMaxScore = this.setMaxScore.bind(this);
    this.changeScoreType = this.changeScoreType.bind(this);
  }

  enableText(event) {
    const { activityIndex, updateActivityFeedbackSettings } = this.props;
    const activityId = this.props.activity.get("id");
    updateActivityFeedbackSettings(
      activityId, activityIndex, {
        textFeedbackEnabled: event.target.checked,
      });
  }

  enableRubric(event) {
    const { activityIndex, updateActivityFeedbackSettings } = this.props;
    const activityId = this.props.activity.get("id");
    updateActivityFeedbackSettings(
      activityId, activityIndex, {
        useRubric: event.target.checked,
      });
  }

  setMaxScore(value) {
    const { activityIndex, updateActivityFeedbackSettings } = this.props;
    const activityId = this.props.activity.get("id");
    updateActivityFeedbackSettings(activityId, activityIndex, {
      maxScore: value,
    });
  }

  changeScoreType(newV) {
    const { activityIndex, updateActivityFeedbackSettings } = this.props;
    const activityId = this.props.activity.get("id").toString();
    const newFlags = { scoreType: newV };
    if (newV !== NO_SCORE) {
      this.setState({lastScoreType: newV});
    }
    if (isAutoScoring(newV)) {
      // When switching from manual to automatic scores, this sets the maxScore to the
      // default Max Score (10), and then it doesn't seem to
      // update this maxScore in the settings when the computation changes
      // I suspect this is because the computedMaxScore prop is based on the old score type
      // and it defaults to 10 when the score type is manual.
      // Perhaps this code handles switching other modes better.
      //
      // TODO: tests for rubric, auto, manual, and no score to see if this
      // line is doing something worth while in some case
      //
      // TODO: see if there is any reason why the computedMaxScore
      // needs to actually be saved as the maxScore
      newFlags.maxScore = this.props.computedMaxScore;
    }
    updateActivityFeedbackSettings(activityId, activityIndex, newFlags);
  }

  render() {
    const { rubric, showText, scoreType, maxScore, useRubric } = this.props;
    const rubricAvailable = !!rubric;
    const scoreEnabled = !!scoreType && scoreType !== NO_SCORE;
    const toggleScoreEnabled = () => {
      if (scoreEnabled) {
        this.changeScoreType(NO_SCORE);
      } else {
        this.changeScoreType(this.state.lastScoreType || MANUAL_SCORE);
      }
    };

    return (
      <FeedbackOptionsView
        useRubric={useRubric}
        rubricAvailable={rubricAvailable}
        scoreEnabled={scoreEnabled}
        scoreType={scoreType}
        maxScore={maxScore}
        enableRubric={this.enableRubric}
        enableText={this.enableText}
        toggleScoreEnabled={toggleScoreEnabled}
        showText={showText}
        changeScoreType={this.changeScoreType}
        setMaxScore={this.setMaxScore}
        allowAutoScoring
      />
    );
  }
}
