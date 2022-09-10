import React, { PureComponent } from "react";
import { connect } from "react-redux";
import Sticky from "react-stickynode";
import Section from "../../components/report/section";
import FeedbackButton from "../../components/report/feedback-button";
import ActivityFeedbackForStudent from "../../components/report/activity-feedback-for-student";
import ActivityFeedbackPanel from "./activity-feedback-panel";
import SummaryIndicator from "../../components/report/summary-indicator";
import {
  makeGetStudentFeedbacks,
  makeGetAutoScores,
  makeGetComputedMaxScore,
} from "../../selectors/activity-feedback-selectors";
import { isAutoScoring, MANUAL_SCORE, MAX_SCORE_DEFAULT } from "../../util/scoring-constants";

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
    return this.props.feedbackSettings?.activitySettings?.[activity?.id] || Map({});
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
    const activityName = activity?.name;
    const showText = feedbackSettings?.textFeedbackEnabled;
    const scoreType = feedbackSettings?.scoreType;
    const maxScore = scoreType === MANUAL_SCORE ? (feedbackSettings?.maxScore || MAX_SCORE_DEFAULT) : computedMaxScore;
    const summaryScores = scoreType === MANUAL_SCORE ? scores : Object.values(autoScores);
    const showScore = scoreType !== "none";
    const useRubric = feedbackSettings?.useRubric;
    const feedbackEnabled = showScore || showText || useRubric;
    let autoScore = null;

    if (isStudentReport) {
      const studentId = reportFor?.id;
      autoScore = isAutoScoring(scoreType) ? autoScores?.[studentId] : null;
    }

    return (
      <div className={`activity ${activity?.visible ? "" : "hidden"}`} data-cy= "activity">
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
          { activity?.children.map(s => <Section key={s?.id} section={s} reportFor={reportFor} />) }
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
    const feedbackSettings = state?.feedback?.settings;
    const rubric = state?.feedback?.settings?.rubric;
    return {
      scores, rubricFeedbacks, feedbacks, feedbacksNeedingReview, needsReviewCount, autoScores, computedMaxScore, feedbackSettings,
      rubric: rubric && rubric
    };
  };
}

const mapDispatchToProps = (dispatch, ownProps) => { return {}; };

export default connect(makeMapStateToProps, mapDispatchToProps)(Activity);
