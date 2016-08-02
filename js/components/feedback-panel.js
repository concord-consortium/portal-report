import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'
import Button from './button'
import FeedbackFilter from './feedback-filter'
import FeedbackOverview from './feedback-overview'
import FeedbackRow from './feedback-row'
import FeedbackButton from './feedback-button'

import { connect } from 'react-redux'
import { updateFeedback } from '../actions'

import '../../css/feedback-panel.less'

@pureRender
class FeedbackPanel extends Component {
  constructor(props) {
    super(props)
    this.state = {
      showOnlyNeedReview: false,
      showFeedbackPanel: false
    }

    this.makeOnlyNeedReview = this.makeOnlyNeedReview.bind(this)
    this.makeShowAll        = this.makeShowAll.bind(this)
    this.showFeedback = this.showFeedback.bind(this)
    this.hideFeedback = this.hideFeedback.bind(this)
    this.answerIsMarkedComplete = this.answerIsMarkedComplete.bind(this)
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

  render() {
    const question      = this.props.question
    const showing       = this.state.showFeedbackPanel
    const prompt        = question.get('prompt')
    const number        = question.get('questionNumber')
    const answers       = question.get('answers')
    const realAnswers   = answers.filter(a => a.get('type') != 'NoAnswer')
    const needingFeedback =  realAnswers.filter( a => ! this.answerIsMarkedComplete(a) )


    const filteredAnswers = this.state.showOnlyNeedReview ? needingFeedback : realAnswers
    const numAnswers       = realAnswers.count()
    const numNoAnswers     = answers.count() - realAnswers.count()
    const numNeedsFeedback = needingFeedback.count()
    const numFeedbackGiven = numAnswers - numNeedsFeedback

    if (!showing) { return (
      <div className="feedback-container">
        <FeedbackButton needsReviewCount={numNeedsFeedback} showFeedback={this.showFeedback}/>
      </div>
    )}
    return (
      <div className="feedback-container">
        <div className="lightbox-background" />
        <div className="feedback-panel">
          <h1>Feedback: Question {number}</h1>
          <h2>{prompt}</h2>
          <div className="feedback-options">
            <label for="written"> Written Feedback</label> <input id="written" type="checkbox"/><br/>
            <label for="score">Score?</label><input id="score" type="checkbox" />
            <span className="max-score">Max. Score <input className="max-score-input" defaultValue="100"/> </span>
          </div>

          <FeedbackOverview
              numNoAnswers     = {numNoAnswers}
              numFeedbackGiven = {numFeedbackGiven}
              numNeedsFeedback = {numNeedsFeedback}
          />

          <FeedbackFilter
            showOnlyNeedReview = {this.state.showOnlyNeedReview}
            makeOnlyNeedReview = {this.makeOnlyNeedReview      }
            makeShowAll        = {this.makeShowAll             }
          />

          <div className="feedback-rows-wrapper">
            <div className="feedback-for-students">
              { filteredAnswers.map(answer =>
                  <FeedbackRow
                    answer={answer}
                    feedbacks={this.props.feedbacks}
                    updateFeedback={this.props.updateFeedback}
                    showOnlyNeedsRiew={this.state.showOnlyNeedReview}
                  />
              )}
            </div>
          </div>
          <Button onClick={this.hideFeedback}>Done</Button>
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
    updateFeedback: (answerKey, feedback) => dispatch(updateFeedback(answerKey, feedback))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(FeedbackPanel)
