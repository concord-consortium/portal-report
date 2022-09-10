import React, { PureComponent } from "react";
import ReactDom from "react-dom";
import Button from "../../components/common/button";
import FeedbackFilter from "../../components/report/feedback-filter";
import FeedbackOverview from "../../components/report/feedback-overview";
import ActivityFeedbackOptions from "../../components/report/activity-feedback-options";
import ActivityFeedbackRow from "../../components/report/activity-feedback-row";
import { TransitionGroup, CSSTransition } from "react-transition-group";
import { connect } from "react-redux";
import { updateActivityFeedback, updateActivityFeedbackSettings } from "../../actions/index";

import {
  makeGetStudentFeedbacks,
  makeGetAutoScores,
  makeGetComputedMaxScore,
} from "../../selectors/activity-feedback-selectors";

import "../../../css/report/feedback-panel.less";
import "../../../css/report/tooltip.less";
import {
  NO_SCORE,
  AUTOMATIC_SCORE,
  RUBRIC_SCORE,
  MAX_SCORE_DEFAULT,
  isAutoScoring,
} from "../../util/scoring-constants";
import { truncate } from "../../util/misc";

class ActivityFeedbackPanel extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      showOnlyNeedReview: true,
    };
    this.studentRowRefs = {};
    this.makeOnlyNeedReview = this.makeOnlyNeedReview.bind(this);
    this.makeShowAll = this.makeShowAll.bind(this);
    this.changeScoreType = this.changeScoreType.bind(this);
    this.scrollStudentIntoView = this.scrollStudentIntoView.bind(this);
    this.studentRowRef = this.studentRowRef.bind(this);
  }

  makeOnlyNeedReview() {
    this.setState({showOnlyNeedReview: true});
  }

  makeShowAll() {
    this.setState({showOnlyNeedReview: false});
  }

  changeScoreType(newV) {
    const activityId = this.props.activity?.id.toString();
    const newFlags = {
      scoreType: newV,
    };
    if (newV !== NO_SCORE) {
      this.setState({lastScoreType: newV});
    }
    if (isAutoScoring(newV)) {
      newFlags.maxScore = this.props.computedMaxScore;
    }
    this.props.updateActivityFeedbackSettings(activityId, newFlags);
  }

  studentRowRef(index) {
    return `student-row-${index}`;
  }

  scrollStudentIntoView(eventProxy) {
    const index = eventProxy.target.value;
    const ref = this.studentRowRef(index - 1);
    const itemComponent = this.studentRowRefs[ref];
    if (itemComponent) {
      // eslint-disable-next-line react/no-find-dom-node
      const domNode = ReactDom.findDOMNode(itemComponent);
      domNode.scrollIntoView();
    }
  }

  getFeedbackSettings(activity) {
    return this.props.settings?.activitySettings?.[activity?.id] || Map({});
  }

  renderGettingStarted() {
    return (
      <div className="getting-started">
        <div className="explainer">
          To start, choose the type of feedback you want to leave in the Feedback Type settings above.
        </div>
        <div className="arrow">⤴</div>
      </div>
    );
  }

  render() {
    const {
      feedbacks,
      activity,
      feedbacksNeedingReview,
      numFeedbacksGivenReview,
      numFeedbacksNeedingReview,
      feedbacksNotAnswered,
      autoScores,
      computedMaxScore,
      rubric,
      activityIndex
    } = this.props;
    const numNotAnswered = feedbacksNotAnswered.size;
    const prompt = truncate(activity?.name || "", 200);
    const activityId = activity?.id;

    const settings = this.getFeedbackSettings(activity);
    const showText = settings?.textFeedbackEnabled || false;
    const scoreType = settings?.scoreType || NO_SCORE;
    const useRubric = settings?.useRubric || false;
    let maxScore;
    switch (scoreType) {
      case AUTOMATIC_SCORE:
      case RUBRIC_SCORE:
        maxScore = computedMaxScore;
        break;
      default:
        maxScore = settings?.maxScore || MAX_SCORE_DEFAULT;
    }

    const filteredFeedbacks = this.state.showOnlyNeedReview ? feedbacksNeedingReview : feedbacks;

    const showGettingStarted = scoreType === NO_SCORE && !showText && !useRubric;

    const hide = function() {
      if (this.props.hide) {
        this.props.hide();
      }
    }.bind(this);

    const studentsPulldown = filteredFeedbacks.map((f) => {
      return {
        realName: f?.student?.realName,
        id: f?.student?.id,
        answer: f,
      };
    });
    return (
      <div className="feedback-container">
        <div className="lightbox-background" />
        <div className="feedback-panel">
          <div className="prompt" dangerouslySetInnerHTML={{ __html: prompt }} />
          <div className="feedback-header tall">
            <FeedbackOverview
              numNoAnswers={numNotAnswered}
              numFeedbackGiven={numFeedbacksGivenReview}
              numNeedsFeedback={numFeedbacksNeedingReview}
            />
            <ActivityFeedbackOptions
              activity={this.props.activity}
              activityIndex={activityIndex}
              showText={showText}
              scoreType={scoreType}
              maxScore={maxScore}
              useRubric={useRubric}
              updateActivityFeedbackSettings={this.props.updateActivityFeedbackSettings}
              computedMaxScore={this.props.computedMaxScore}
              rubric={rubric}
            />
          </div>

          <div className="main-feedback">
            <FeedbackFilter
              showOnlyNeedReview={this.state.showOnlyNeedReview}
              studentSelected={this.scrollStudentIntoView}
              makeOnlyNeedReview={this.makeOnlyNeedReview}
              students={studentsPulldown}
              makeShowAll={this.makeShowAll}
              disable={showGettingStarted}
            />

            <div className="feedback-rows-wrapper">
              { showGettingStarted ? this.renderGettingStarted() : ""}
              <div className="feedback-for-students">
                <TransitionGroup>
                  { filteredFeedbacks.map((studentActivityFeedback, i) => {
                    const studentId = studentActivityFeedback?.platformStudentId;
                    return (
                      <CSSTransition
                        key={i}
                        timeout={500}
                        classNames="answer"
                      >
                        <ActivityFeedbackRow
                          studentActivityFeedback={studentActivityFeedback}
                          activityId={activityId}
                          activityIndex={activityIndex}
                          key={`${activityId}-${studentId}`}
                          studentId={studentId}
                          ref={(row) => { this.studentRowRefs[this.studentRowRef(i)] = row; }}
                          scoreType={scoreType}
                          autoScore={autoScores?.[studentId]}
                          feedbackEnabled={showText}
                          useRubric={useRubric}
                          rubric={rubric}
                          maxScore={maxScore}
                          updateActivityFeedback={this.props.updateActivityFeedback}
                          showOnlyNeedReview={this.state.showOnlyNeedReview}
                        />
                      </CSSTransition>
                    );
                  },
                  )}
                </TransitionGroup>
              </div>
            </div>
          </div>
          <div className="footer">
            <Button onClick={hide} data-cy="feedback-done-button">Done</Button>
          </div>
        </div>
      </div>
    );
  }
}

function makeMapStateToProps() {
  return (state, ownProps) => {
    const getFeedbacks = makeGetStudentFeedbacks();
    const getMaxSCore = makeGetComputedMaxScore();
    const getAutoscores = makeGetAutoScores();
    const {
      feedbacks,
      feedbacksNeedingReview,
      numFeedbacksNeedingReview,
      feedbacksNotAnswered,
    } = getFeedbacks(state, ownProps);
    const numFeedbacksGivenReview = feedbacks.size - numFeedbacksNeedingReview - feedbacksNotAnswered.size;
    const computedMaxScore = getMaxSCore(state, ownProps);
    const autoScores = getAutoscores(state, ownProps);
    const rubric = state?.feedback?.settings?.rubric;
    return {
      feedbacks, feedbacksNeedingReview, numFeedbacksNeedingReview, numFeedbacksGivenReview,
      feedbacksNotAnswered, computedMaxScore, autoScores,
      settings: state?.feedback?.settings,
      rubric: rubric && rubric,
      activityIndex: ownProps.activity?.activityIndex
    };
  };
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    updateActivityFeedback: (activityId, activityIndex, platformStudentId, feedback) => dispatch(updateActivityFeedback(activityId, activityIndex, platformStudentId, feedback)),
    updateActivityFeedbackSettings: (activityId, activityIndex, feedbackFlags) => dispatch(updateActivityFeedbackSettings(activityId, activityIndex, feedbackFlags)),
  };
};

export default connect(makeMapStateToProps, mapDispatchToProps)(ActivityFeedbackPanel);
