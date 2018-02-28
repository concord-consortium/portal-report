import React, { PureComponent } from 'react' // eslint-disable-line
import ReactDom from 'react-dom'
import Button from '../components/button'
import FeedbackFilter from '../components/feedback-filter'
import FeedbackOverview from '../components/feedback-overview'
import FeedbackOptions from '../components/feedback-options'
import FeedbackRow from '../components/activity-feedback-row'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'
import { connect } from 'react-redux'
import { updateActivityFeedback, enableActivityFeedback} from '../actions'
import {
  getActivityFeedbacks,
  getFeedbacksNeedingReview,
  getFeedbacksNotAnswered,
  getComputedMaxScore,
  getQuestions,
  calculateStudentScores
} from '../core/activity-feedback-data'
import '../../css/feedback-panel.less'
import '../../css/tooltip.less'
import {
  NO_SCORE,
  AUTOMATIC_SCORE
} from "../util/scoring-constants"

class ActivityFeedbackPanel extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      showOnlyNeedReview: true,
    }
    this.makeOnlyNeedReview = this.makeOnlyNeedReview.bind(this)
    this.makeShowAll  = this.makeShowAll.bind(this)
    this.changeScoreType = this.changeScoreType.bind(this)
    this.scrollStudentIntoView = this.scrollStudentIntoView.bind(this)
    this.studentRowRef = this.studentRowRef.bind(this)
  }

  makeOnlyNeedReview() {
    this.setState({showOnlyNeedReview: true})
  }

  makeShowAll() {
    this.setState({showOnlyNeedReview: false})
  }

  changeScoreType(newV) {
    const activityId = this.props.activity.get('id').toString()
    const activityFeedbackId = this.props.activity.get('activityFeedbackId')
    const newFlags = {
      activityFeedbackId,
      scoreType: newV
    }
    if(newV != NO_SCORE) {
      this.setState({lastScoreType: newV})
    }
    if(newV == AUTOMATIC_SCORE) {
      newFlags.maxScore = this.props.computedMaxScore;
    }
    this.props.enableActivityFeedback(activityId, newFlags);
  }

  studentRowRef(index) {
    return `student-row-${index}`
  }

  scrollStudentIntoView(eventProxy) {
    const index = eventProxy.target.value
    const ref = this.studentRowRef(index - 1)
    const itemComponent = this.refs[ref]
    if (itemComponent) {
      const domNode = ReactDom.findDOMNode(itemComponent)
      domNode.scrollIntoView()
    }
  }

  renderGettingStarted() {
    return(
      <div className="gettingStarted">
        <div className="explainer">
          To start, choose the type of feedback you want to leave in the Feedback Type settings above.
        </div>
        <div className="arrow">⤴</div>
      </div>
    )
  }

  render() {
    const {
      feedbacks,
      activity,
      feedbacksNeedingReview,
      numFeedbacksGivenReview,
      numFeedbacksNeedingReview,
      notAnswerd,
      autoScores,
      computedMaxScore
    }  = this.props;
    const numNotAnswered = notAnswerd.size
    const prompt = activity.get("name")
    const scoreType = activity.get("scoreType") || NO_SCORE
    const showText = activity.get("enableTextFeedback")
    const useRubric = activity.get("useRubric")
    const activityFeedbackId = activity.get('activityFeedbackId')
    const filteredFeedbacks = this.state.showOnlyNeedReview ? feedbacksNeedingReview : feedbacks
    const maxScore = scoreType == "auto" ? computedMaxScore : activity.get("maxScore")
    const showGettingStarted = scoreType === NO_SCORE && !showText && !useRubric

    const hide = function() {
      if(this.props.hide) {
        this.props.hide();
      }
    }.bind(this);

    const studentsPulldown = filteredFeedbacks.map((f) => {
      return {
        realName: f.getIn(['student', 'realName']),
        id: f.getIn(['student', 'id']),
        answer: f,
      }
    })
    return (
      <div className="feedback-container">
        <div className="lightbox-background" />
        <div className="feedback-panel">
          <div className="feedback-header">
            <div className="left">
              <h2>{prompt} </h2>
              <FeedbackOverview
                numNoAnswers={numNotAnswered}
                numFeedbackGiven={numFeedbacksGivenReview}
                numNeedsFeedback={numFeedbacksNeedingReview}
              />
            </div>

            <FeedbackOptions
              activity={this.props.activity}
              scoreEnabled={this.state.scoreEnabled}
              toggleScoreEnabled={this.toggleScoreEnabled}
              enableActivityFeedback={this.props.enableActivityFeedback}
              computedMaxScore={this.props.computedMaxScore}
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
              { showGettingStarted ?  this.renderGettingStarted() : ""}
              <div className="feedback-for-students">
                <ReactCSSTransitionGroup transitionName="answer" transitionEnterTimeout={400} transitionLeaveTimeout={300}>
                { filteredFeedbacks.map((studentActivityFeedback, i) => {
                    const studentId = studentActivityFeedback.get('studentId')
                    return <FeedbackRow
                      studentActivityFeedback = {studentActivityFeedback}
                      activityFeedbackId = { activityFeedbackId }
                      key={ `${activityFeedbackId}-${studentId}`}
                      ref={ () => this.studentRowRef(i)}
                      scoreType={scoreType}
                      autoScore={autoScores.get(studentId)}
                      feedbackEnabled={showText}
                      useRubric={useRubric}
                      maxScore={maxScore}
                      updateFeedback={this.props.updateActivityFeedback}
                      showOnlyNeedReview={this.state.showOnlyNeedReview}
                    />
                  }
                )}
                </ReactCSSTransitionGroup>
              </div>
            </div>
          </div>
          <div className="footer">
            <Button onClick = {hide}>Done</Button>
          </div>
        </div>
      </div>

    )
  }
}


function mapStateToProps(state, ownProps) {
  const actId = ownProps.activity.get('id')
  const feedbacks = getActivityFeedbacks(state, actId)
  const feedbacksNeedingReview = getFeedbacksNeedingReview(feedbacks)
  const numFeedbacksNeedingReview = feedbacksNeedingReview.size
  const notAnswerd = getFeedbacksNotAnswered(feedbacks)
  const numFeedbacksGivenReview = feedbacks.size - numFeedbacksNeedingReview - notAnswerd.size
  const questions = getQuestions(state, actId)
  const computedMaxScore = getComputedMaxScore(questions)
  const autoScores = calculateStudentScores(state, questions)

  return { feedbacks, feedbacksNeedingReview, numFeedbacksNeedingReview, numFeedbacksGivenReview, notAnswerd, computedMaxScore, autoScores}
}

const mapDispatchToProps = (dispatch) => {
  return {
    updateActivityFeedback: (answerKey, feedback) => dispatch(updateActivityFeedback(answerKey, feedback)),

    enableActivityFeedback: (activityKey, feedbackFlags)  => dispatch(enableActivityFeedback(activityKey, feedbackFlags)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ActivityFeedbackPanel)
