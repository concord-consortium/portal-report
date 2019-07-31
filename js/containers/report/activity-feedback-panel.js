import React, { PureComponent } from "react"; // eslint-disable-line
import ReactDom from "react-dom";
import Button from "../../components/common/button";
import FeedbackFilter from "../../components/report/feedback-filter";
import FeedbackOverview from "../../components/report/feedback-overview";
import ActivityFeedbackOptions from "../../components/report/activity-feedback-options";
import ActivityFeedbackRow from "../../components/report/activity-feedback-row";
import { TransitionGroup, CSSTransition } from "react-transition-group";
import { connect } from "react-redux";
import { updateActivityFeedback, updateActivityFeedbackSettings } from "../../actions/index";
import { Map } from "immutable";

import {
  makeGetStudentFeedbacks,
  makeGetRubric,
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
import { fromJS } from "immutable";

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
    const activityId = this.props.activity.get("id").toString();
    const activityFeedbackId = this.props.activity.get("activityFeedbackId");
    const newFlags = {
      activityFeedbackId,
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
      const domNode = ReactDom.findDOMNode(itemComponent);
      domNode.scrollIntoView();
    }
  }

  getFeedbackSettings(activity) {
    return this.props.settings.getIn(["activitySettings", activity.get("id")]) || Map({});
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
      rubric
    } = this.props;
    const numNotAnswered = feedbacksNotAnswered.size;
    const prompt = truncate(activity.get("name") || "", 200);
    const activityId = activity.get("id");

    const settings = this.getFeedbackSettings(activity);
    const showText = settings.get("textFeedbackEnabled") || false;
    const scoreType = settings.get("scoreType") || NO_SCORE;
    const useRubric = settings.get("useRubric") || false;
    let maxScore;
    switch (scoreType) {
      case AUTOMATIC_SCORE:
      case RUBRIC_SCORE:
        maxScore = computedMaxScore;
        break;
      default:
        maxScore = settings.get("maxScore") || MAX_SCORE_DEFAULT;
    }

    const activityFeedbackId = activity.get("activityFeedbackId");
    const filteredFeedbacks = this.state.showOnlyNeedReview ? feedbacksNeedingReview : feedbacks;

    const showGettingStarted = scoreType === NO_SCORE && !showText && !useRubric;

    const hide = function() {
      if (this.props.hide) {
        this.props.hide();
      }
    }.bind(this);

    const studentsPulldown = filteredFeedbacks.map((f) => {
      return {
        realName: f.getIn(["student", "realName"]),
        id: f.getIn(["student", "id"]),
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
              showText={showText}
              scoreType={scoreType}
              maxScore={maxScore}
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
                    const studentId = studentActivityFeedback.get("studentId");
                    return (
                      <CSSTransition
                        key={i}
                        timeout={500}
                        classNames="answer"
                      >
                        <ActivityFeedbackRow
                          studentActivityFeedback={studentActivityFeedback}
                          activityFeedbackId={activityFeedbackId}
                          key={`${activityFeedbackId}-${studentId}`}
                          ref={(row) => { this.studentRowRefs[this.studentRowRef(i)] = row; }}
                          scoreType={scoreType}
                          autoScore={autoScores.get(studentId)}
                          feedbackEnabled={showText}
                          useRubric={useRubric}
                          activityId={activityId}
                          rubric={rubric}
                          maxScore={maxScore}
                          updateQuestionFeedbacks={this.props.updateActivityFeedback}
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
            <Button onClick={hide}>Done</Button>
          </div>
        </div>
      </div>

    );
  }
}

function makeMapStateToProps() {
  return (state, ownProps) => {
    const getFeedbacks = makeGetStudentFeedbacks();
    const getRubric = makeGetRubric();
    const getMaxSCore = makeGetComputedMaxScore();
    // const getAutoscores = makeGetAutoScores();
    const rubric = getRubric(state, ownProps);
    const {
      feedbacks,
      feedbacksNeedingReview,
      numFeedbacksNeedingReview,
      feedbacksNotAnswered,
    } = getFeedbacks(state, ownProps);
    const numFeedbacksGivenReview = feedbacks.size - numFeedbacksNeedingReview - feedbacksNotAnswered.size;
    const computedMaxScore = getMaxSCore(state, ownProps);
    // const autoScores = getAutoscores(state, ownProps);
    const autoScores = [];
    return {
      rubric, feedbacks, feedbacksNeedingReview, numFeedbacksNeedingReview, numFeedbacksGivenReview,
      feedbacksNotAnswered, computedMaxScore, autoScores,
      settings: state.getIn(["feedback", "settings"])
    };
  };
}

const mapDispatchToProps = (dispatch) => {
  return {
    updateActivityFeedback: (answerId, feedback) => dispatch(updateActivityFeedback(answerId, feedback)),
    updateActivityFeedbackSettings: (activityId, feedbackFlags) => dispatch(updateActivityFeedbackSettings(activityId, feedbackFlags)),
  };
};

export default connect(makeMapStateToProps, mapDispatchToProps)(ActivityFeedbackPanel);
