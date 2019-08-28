import React, { PureComponent } from "react";
import { connect } from "react-redux";
import Sticky from "react-stickynode";
import Section from "../../components/report/section";
import FeedbackButton from "../../components/report/feedback-button";
import ActivityFeedbackForStudent from "../../components/report/activity-feedback-for-student";
import ActivityFeedbackPanel from "./activity-feedback-panel";
import SummaryIndicator from "../../components/report/summary-indicator";
import { Map } from "immutable";
import {
  makeGetStudentFeedbacks,
  makeGetAutoScores,
  makeGetComputedMaxScore,
} from "../../selectors/activity-feedback-selectors";
import { isAutoScoring, MANUAL_SCORE, MAX_SCORE_DEFAULT } from '../../util/scoring-constants'

import "../../../css/report/activity.less";

class Activity extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      showFeedbackPanel: false,
    };
    this.showFeedback = this.showFeedback.bind(this);
    this.hideFeedback = this.hideFeedback.bind(this);
  }

  showFeedback() {
    this.setState({
      showFeedbackPanel: true,
    });
  }

  hideFeedback() {
    this.setState({
      showFeedbackPanel: false,
    });
  }

  getFeedbackSettings(activity) {
    return this.props.feedbackSettings.getIn(["activitySettings", activity.get("id")]) || Map({});
  }

  render() {
    const {
      activity,
      reportFor,
      needsReviewCount,
      feedbacks,
      computedMaxScore,
      autoScores,
      rubric,
      rubricFeedbacks,
      scores,
    } = this.props;
    const { showFeedbackPanel } = this.state;

    const feedbackSettings = this.getFeedbackSettings(activity);
    const isClassReport = reportFor === "class";
    const isStudentReport = !isClassReport;
    const activityName = activity.get("name");
    const showText = feedbackSettings.get("textFeedbackEnabled");
    const scoreType = feedbackSettings.get("scoreType");
    const maxScore = scoreType === MANUAL_SCORE ? (feedbackSettings.get("maxScore") || MAX_SCORE_DEFAULT) : computedMaxScore;
    const summaryScores = scoreType === MANUAL_SCORE ? scores : Object.values(autoScores.toJS());
    const showScore = scoreType !== "none";
    const useRubric = feedbackSettings.get("useRubric");
    const feedbackEnabled = showScore || showText || useRubric;
    let autoScore = null;

    if (isStudentReport) {
      const studentId = reportFor.get("id");
      autoScore = isAutoScoring(scoreType) ? autoScores.get(studentId) : null;
    }

    return (
      <div className={`activity ${activity.get("visible") ? "" : "hidden"}`}>
        <Sticky top={60}>
          <h3>{activityName} </h3>
        </Sticky>
        {
          isClassReport &&
          <div className="feedback">
            <FeedbackButton text="Provide overall feedback" needsReviewCount={needsReviewCount}
              feedbackEnabled={feedbackEnabled} showFeedback={this.showFeedback} />
          </div>
        }
        {
          isClassReport &&
          <SummaryIndicator scores={summaryScores} maxScore={maxScore} useRubric={useRubric} showScore={showScore}
            rubricFeedbacks={rubricFeedbacks} rubric={rubric} />
        }
        {
          isStudentReport &&
          <div className="student-feedback-panel">
            <ActivityFeedbackForStudent
              student={reportFor}
              feedbacks={feedbacks}
              showScore={showScore}
              maxScore={maxScore}
              showText={showText}
              useRubric={useRubric}
              rubric={rubric}
              autoScore={autoScore}
              feedbackEnabled={feedbackEnabled}
            />
          </div>
        }
        <div>
          {
            isClassReport && showFeedbackPanel &&
            <ActivityFeedbackPanel hide={this.hideFeedback} activity={activity} />
          }
          { activity.get("children").map(s => <Section key={s.get("id")} section={s} reportFor={reportFor} />) }
        </div>
      </div>
    );
  }
}

function makeMapStateToProps() {
  return (state, ownProps) => {
    const getFeedbacks = makeGetStudentFeedbacks();
    const getAutoMaxScore = makeGetComputedMaxScore();
    const getAutoScores = makeGetAutoScores();
    const computedMaxScore = getAutoMaxScore(state, ownProps);
    const autoScores = getAutoScores(state, ownProps);
    const {
      feedbacksNeedingReview,
      feedbacks,
      scores,
      rubricFeedbacks } = getFeedbacks(state, ownProps);
    const needsReviewCount = feedbacksNeedingReview.size;
    const feedbackSettings = state.getIn(["feedback", "settings"]);
    const rubric = state.getIn(["feedback", "settings", "rubric"]);
    return {
      scores, rubricFeedbacks, feedbacks, feedbacksNeedingReview, needsReviewCount, autoScores, computedMaxScore, feedbackSettings,
      rubric: rubric && rubric.toJS()
    };
  };
}

const mapDispatchToProps = (dispatch, ownProps) => { return {}; };

export default connect(makeMapStateToProps, mapDispatchToProps)(Activity);
