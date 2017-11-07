import React, { PureComponent } from 'react'
import ReactDom from 'react-dom'
import { fromJS } from 'immutable'
import Button from '../components/button'
import FeedbackFilter from '../components/feedback-filter'
import FeedbackOverview from '../components/feedback-overview'
import FeedbackRow from '../components/activity-feedback-row'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'
import ReactTooltip from 'react-tooltip'
import { connect } from 'react-redux'
import { updateActivityFeedback, enableActivityFeedback} from '../actions'
import {
  getActivityFeedbacks,
  getFeedbacksNeedingReview,
  getFeedbacksNotAnswered,
  getComputedMaxScore,
  getQuestions,
  getStudentScore
} from '../core/activity-feedback-data'

import {RadioGroup, Radio} from 'react-radio-group'

import '../../css/feedback-panel.less'
import '../../css/tooltip.less'

const NO_SCORE_L        = "No scoring"
const NO_SCORE          = "none"

const MANUAL_SCORE_L    = "Manual Scoring"
const MANUAL_SCORE      = "manual"

const AUTOMATIC_SCORE_L = "Automatic Scoring"
const AUTOMATIC_SCORE   = "auto"

class ActivityFeedbackPanel extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      showOnlyNeedReview: true,
    }
    this.makeOnlyNeedReview = this.makeOnlyNeedReview.bind(this)
    this.makeShowAll  = this.makeShowAll.bind(this)
    this.enableText  = this.enableText.bind(this)
    this.setMaxScore = this.setMaxScore.bind(this)
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


  enableText(event) {
    const activityId = this.props.activity.get('id')
    const activityFeedbackId = this.props.activity.get('activityFeedbackId')
    this.props.enableActivityFeedback(activityId, {activityFeedbackId: activityFeedbackId, enableTextFeedback: event.target.checked})
  }


  setMaxScore(event) {
    const value = parseInt(event.target.value) || null
    const activityId = this.props.activity.get('id')
    const activityFeedbackId = this.props.activity.get('activityFeedbackId')
    this.props.enableActivityFeedback(activityId, {activityFeedbackId: activityFeedbackId, maxScore: value})
  }

  changeScoreType(newV) {
    const activityId = this.props.activity.get('id').toString()
    const activityFeedbackId = this.props.activity.get('activityFeedbackId')
    const newFlags = {activityFeedbackId: activityFeedbackId, scoreType: newV}
    if(newV != NO_SCORE) {
      this.setState({lastScoreType: newV})
    }
    if(newV == AUTOMATIC_SCORE) {
      newFlags.maxScore = this.props.computedMaxScore;
    }
    this.props.enableActivityFeedback(activityId, newFlags);
  }

  studentRowRef(index){
    return `student-row-${index}`
  }

  scrollStudentIntoView(eventProxy) {
    const index = eventProxy.target.value
    const ref = this.studentRowRef(index-1)
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
    }  = this.props;
    const numNotAnswered = notAnswerd.size
    const prompt = activity.get("name")
    const scoreType = activity.get("scoreType") || NO_SCORE
    const showText = activity.get("enableTextFeedback")
    const maxScore = activity.get("maxScore")
    const activityFeedbackId = activity.get('activityFeedbackId')
    const filteredFeedbacks = this.state.showOnlyNeedReview ? feedbacksNeedingReview : feedbacks
    const scoreEnabled = (scoreType != NO_SCORE)
    const showGettingStarted = (scoreType === NO_SCORE) && (!showText)
    const scoreClassName = scoreEnabled ? "enabled" : "disabled"
    const toggleScoreEnabled = () => {
      if(scoreEnabled) {
        this.changeScoreType(NO_SCORE)
      } else {
        this.changeScoreType(this.state.lastScoreType || MANUAL_SCORE)
      }
    }

    const hide = function() {
      if(this.props.hide) {
        this.props.hide();
      }
    }.bind(this);

    const studentsPulldown = filteredFeedbacks.map( (f) => {
      return {
        realName: f.getIn(['student', 'realName']),
        id: f.getIn(['student','id']),
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

            <div className="feedback-options">
              <input id="feedbackEnabled" type="checkbox" checked={showText} onChange={this.enableText}/>
              <label htmlFor="feedbackEnabled">Provide written feedback</label>
              <br/>
              <input id="giveScore" name="giveScore" type="checkbox" checked={scoreEnabled} onChange={toggleScoreEnabled}/>
              <label htmlFor="giveScore">Give Score</label>
              <br/>
              <div className={scoreClassName} style={{marginLeft:'1em'}}>
                {/*
                ******************************************************************************************
                ** This feature had to be put on ice, because automatic scoring was incomplete.
                ** TODO: Resusitate this feature by viewing thsese PT Stories:
                ** https://www.pivotaltracker.com/story/show/151224400
                ** https://www.pivotaltracker.com/story/show/152085045
                ** This work is *mostly* complete in this branch:
                ** https://github.com/concord-consortium/portal-report/tree/add-auto-scores-to-activity-feedback
                ** NP 2017-10-25
                ******************************************************************************************

                  <RadioGroup
                    name="scoreType"
                    selectedValue={scoreType}
                    onChange={this.changeScoreType}
                  >
                    <div>
                      <Radio value={MANUAL_SCORE} />
                      <span className="tooltip" data-tip data-for="MANUAL_SCORE"> {MANUAL_SCORE_L} </span>
                    </div>
                    <div>
                      <Radio value={AUTOMATIC_SCORE} />
                      <span className="tooltip" data-tip data-for="AUTOMATIC_SCORE"> {AUTOMATIC_SCORE_L} </span>
                    </div>

                    <ReactTooltip id="NO_SCORE" place="top" type="dark" delayShow={500}>
                      No activity level score.
                    </ReactTooltip>
                    <ReactTooltip id="MANUAL_SCORE" place="top" type="dark" delayShow={500}>
                      Provide your own activity level score.
                    </ReactTooltip>
                    <ReactTooltip id="AUTOMATIC_SCORE" place="top" type="dark" delayShow={500}>
                      Sum scores from individual questions.
                    </ReactTooltip>
                  </RadioGroup>

                  { (scoreType == MANUAL_SCORE)
                  ?
                    <div>
                      <label className="max-score">Max. Score</label>
                      <input className="max-score-input" value={maxScore} onChange={this.setMaxScore}/>
                    </div>
                  :
                    <div>
                      <label className="max-score disabled">Max. Score</label>
                      <input className="max-score-input disabled" disabled={true} value={maxScore} onChange={this.setMaxScore}/>
                    </div>
                }
                */}

                  <div>
                    <label className="max-score">Max. Score</label>
                    <input className="max-score-input" value={maxScore} onChange={this.setMaxScore}/>
                  </div>

              </div>
            </div>
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
                      ref={elm => this.studentRowRef(i)}
                      scoreEnabled={scoreType === MANUAL_SCORE}
                      feedbackEnabled={showText}
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
  const numFeedbacksNeedingReview =feedbacksNeedingReview.size
  const notAnswerd = getFeedbacksNotAnswered(feedbacks)
  const numFeedbacksGivenReview = feedbacks.size - numFeedbacksNeedingReview - notAnswerd.size
  const questions = getQuestions(state, actId)
  /******************************************************************************************
  ** This feature had to be put on ice, because automatic scoring was incomplete.
  ** TODO: Resusitate this feature by viewing thsese PT Stories:
  ** https://www.pivotaltracker.com/story/show/151224400
  ** https://www.pivotaltracker.com/story/show/152085045
  ** This work is *mostly* complete in this branch:
  ** https://github.com/concord-consortium/portal-report/tree/add-auto-scores-to-activity-feedback
  ** NP 2017-10-25
  ******************************************************************************************
  // const computedMaxScore = getComputedMaxScore(questions)
  // const studentScore = getStudentScore(state, questions, 10)
  */
  const computedMaxScore = 20
  return { feedbacks, feedbacksNeedingReview, numFeedbacksNeedingReview, numFeedbacksGivenReview, notAnswerd, computedMaxScore}
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    updateActivityFeedback: (answerKey, feedback) => dispatch(updateActivityFeedback(answerKey, feedback)),
    enableActivityFeedback: (activityKey, feedbackFlags)  => dispatch(enableActivityFeedback(activityKey, feedbackFlags)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ActivityFeedbackPanel)
