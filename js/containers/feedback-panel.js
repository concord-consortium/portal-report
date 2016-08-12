import React, { Component } from 'react'
import ReactDom from 'react-dom'

import pureRender from 'pure-render-decorator'
import Button from '../components/button'
import FeedbackFilter from '../components/feedback-filter'
import FeedbackOverview from '../components/feedback-overview'
import FeedbackRow from '../components/feedback-row'
import FeedbackButton from '../components/feedback-button'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'

import { connect } from 'react-redux'
import { updateFeedback, enableFeedback} from '../actions'

import '../../css/feedback-panel.less'

@pureRender
class FeedbackPanel extends Component {
  constructor(props) {
    super(props)
    this.state = {
      showOnlyNeedReview: true,
      showFeedbackPanel: false
    }

    this.makeOnlyNeedReview = this.makeOnlyNeedReview.bind(this)
    this.makeShowAll  = this.makeShowAll.bind(this)
    this.showFeedback = this.showFeedback.bind(this)
    this.hideFeedback = this.hideFeedback.bind(this)
    this.answerIsMarkedComplete = this.answerIsMarkedComplete.bind(this)
    this.enableText  = this.enableText.bind(this)
    this.enableScore = this.enableScore.bind(this)
    this.setMaxScore = this.setMaxScore.bind(this)
    this.scrollStudentIntoView = this.scrollStudentIntoView.bind(this)
    this.studentRowRef = this.studentRowRef.bind(this)
  }


  makeOnlyNeedReview() {
    this.setState({showOnlyNeedReview: true})
  }

  makeShowAll() {
    this.setState({showOnlyNeedReview: false})
  }

  showFeedback() {
    this.setState({
      showFeedbackPanel: true
    })
  }

  hideFeedback() {
    this.setState({
      showFeedbackPanel: false
    })
  }

  answerIsMarkedComplete(answer) {
    const feedbackId = answer.get('feedbacks').last() && answer.get('feedbacks').last()
    const feedback = this.props.feedbacks.get(feedbackId)
    return feedback && feedback.get("hasBeenReviewed")
  }

  enableText(event) {
    this.props.enableFeedback(this.props.question.get('key'), {feedbackEnabled: event.target.checked})
  }

  enableScore(event) {
    this.props.enableFeedback(this.props.question.get('key'), {scoreEnabled: event.target.checked})
  }

  setMaxScore(event) {
    const value = parseInt(event.target.value) || null
    this.props.enableFeedback(this.props.question.get('key'), {maxScore: value})
  }

  studentRowRef(index){
    return `student-row-${index}`
  }

  scrollStudentIntoView(eventProxy) {
    const index = eventProxy.target.value
    const ref = this.studentRowRef(index)
    const itemComponent = this.refs[ref]
    if (itemComponent) {
      const domNode = ReactDom.findDOMNode(itemComponent)
      domNode.scrollIntoView()
    }
  }

  render() {
    const question      = this.props.question
    const showing       = this.state.showFeedbackPanel
    const prompt        = question.get('prompt')
    const number        = question.get('questionNumber')
    const answers       = question.get('answers')
      .sortBy( (a) =>
        (a.getIn(['student', 'lastName']) + a.getIn(['student', 'firstName'])).toLowerCase()
      )

    const realAnswers     = answers.filter(a => a.get('type') != 'NoAnswer')
    const needingFeedback = realAnswers.filter( a => ! this.answerIsMarkedComplete(a) )

    const filteredAnswers = this.state.showOnlyNeedReview ? needingFeedback : answers
    const numAnswers       = realAnswers.count()
    const numNoAnswers     = answers.count() - realAnswers.count()
    var   numNeedsFeedback = needingFeedback.count()
    var   numFeedbackGiven = numAnswers - numNeedsFeedback

    const scoreEnabled = question.get('scoreEnabled')
    const feedbackEnabled = question.get('feedbackEnabled')
    const maxScore = question.get('maxScore')

    const studentsPulldown = filteredAnswers.map( (a) => {
      return {
        realName: a.getIn(['student', 'realName']),
        id: a.getIn(['student','id']),
        answer: a,
      }
    })
    if((!scoreEnabled) && (!feedbackEnabled)) {
      numNeedsFeedback = 0
      numFeedbackGiven = 0
    }


    if (!showing) { return (
      <div className="feedback-container">
        <FeedbackButton
          feedbackEnabled={feedbackEnabled || scoreEnabled}
          needsReviewCount={numNeedsFeedback}
          showFeedback={this.showFeedback}/>
      </div>
    )}
    return (
      <div className="feedback-container">
        <div className="lightbox-background" />
        <div className="feedback-panel">
          <h1>Feedback: Question {number}</h1>
          <h2 dangerouslySetInnerHTML={ {__html: prompt} }/>
          <div className="feedback-header">
            <FeedbackOverview
              numNoAnswers={numNoAnswers}
              numFeedbackGiven={numFeedbackGiven}
              numNeedsFeedback={numNeedsFeedback}
            />

            <div className="feedback-options">
              <h3>Feedback Type</h3>

              <input id="feedbackEnabled" type="checkbox" checked={feedbackEnabled} onChange={this.enableText}/>
              <label htmlFor="feedbackEnabled"> Give Written Feedback</label>
              <br/>

              <input id="scoreEnabled" checked={scoreEnabled} type="checkbox" onChange={this.enableScore}/>
              <label htmlFor="scoreEnabled">Give Score</label>
              <br/>
              { scoreEnabled ?
                <div>
                  <label className="max-score">Max. Score</label>
                  <input className="max-score-input" value={maxScore} onChange={this.setMaxScore}/>
                </div> : ""
              }


            </div>
          </div>

          <FeedbackFilter
            showOnlyNeedReview={this.state.showOnlyNeedReview}
            studentSelected={this.scrollStudentIntoView}
            makeOnlyNeedReview={this.makeOnlyNeedReview}
            students={studentsPulldown}
            makeShowAll={this.makeShowAll}
          />


          <div className="feedback-rows-wrapper">
            <div className="feedback-for-students">
              <ReactCSSTransitionGroup transitionName="answer" transitionEnterTimeout={400} transitionLeaveTimeout={300}>
              { filteredAnswers.map((answer, i) =>
                  <FeedbackRow
                    answer={answer}
                    ref={this.studentRowRef(i)}
                    key={answer.get('key')}
                    scoreEnabled={scoreEnabled}
                    feedbackEnabled={feedbackEnabled}
                    maxScore={maxScore}
                    feedbacks={this.props.feedbacks}
                    updateFeedback={this.props.updateFeedback}
                    showOnlyNeedsRiew={this.state.showOnlyNeedReview}
                  />
              )}
              </ReactCSSTransitionGroup>
            </div>
          </div>

          <Button onClick = {this.hideFeedback}>Done</Button>
        </div>
        </div>

    )
  }
}


function mapStateToProps(state) {
  return { feedbacks: state.getIn(['report','feedbacks']) }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    updateFeedback: (answerKey, feedback) => dispatch(updateFeedback(answerKey, feedback)),
    enableFeedback: (embeddableKey, feedbackFlags)  => dispatch(enableFeedback(embeddableKey, feedbackFlags)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(FeedbackPanel)
