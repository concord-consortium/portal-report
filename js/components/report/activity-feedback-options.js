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
    const activityId = this.props.activity.get("id");
    this.props.updateActivityFeedbackSettings(
      activityId, {
        textFeedbackEnabled: event.target.checked,
      });
  }

  enableRubric(event) {
    const activityId = this.props.activity.get("id");
    this.props.updateActivityFeedbackSettings(
      activityId, {
        useRubric: event.target.checked,
      });
  }

  setMaxScore(value) {
    const activityId = this.props.activity.get("id");
    this.props.updateActivityFeedbackSettings(activityId, {
      maxScore: value,
    });
  }

  changeScoreType(newV) {
    const activityId = this.props.activity.get("id").toString();
    const newFlags = { scoreType: newV };
    if (newV !== NO_SCORE) {
      this.setState({lastScoreType: newV});
    }
    if (isAutoScoring(newV)) {
      newFlags.maxScore = this.props.computedMaxScore;
    }
    this.props.updateActivityFeedbackSettings(activityId, newFlags);
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
