import React, { PureComponent } from 'react'


import '../../css/activity-feedback.less'

export default class ActivityFeedbackForStudent extends PureComponent {

  renderTextSection(feedback) {
    const { showText } = this.props
    if(showText) {
      return (
        <div className="feedback-section written-feedback">
         <h1>Overall Feedback:</h1>
          <span>{feedback.feedback}</span>
        </div>
      )
    }
    return <div/>
  }

  renderScoreSection(feedback) {
    const { showScore } = this.props
    if(showScore) {
      return(
        <div className="feedback-section score">
          <h1>Overall Score:</h1>
          <span className="score">{feedback.score}</span>
        </div>
      )
    }
    return <div/>
  }


  render() {
    const {student, feedbacks, feedbackEnabled}  = this.props
    if(!feedbackEnabled) { return <div/>}

    let feedback = {
      hasBeenReviewed: false,
      score:0,
      feedback:""
    }
    const _feedbacks = feedbacks
      .find( (f) => f.get('studentId') == student.get('id'))

    if(_feedbacks){
      const fblist = _feedbacks.get('feedbacks')
      if(fblist && fblist.size > 0) {
        feedback = fblist.first().toJS()
      }
    }

    const showFeedback = (feedback && feedback.hasBeenReviewed)

    const feedbackDiv =
      <div className="feedback">
        { this.renderTextSection(feedback)   }
        { this.renderScoreSection(feedback)  }
      </div>

    const noFeedbackDiv =
      <div className="feedback noFeedback">
        No overall feedback yet.
      </div>

    const displayDiv = showFeedback ? feedbackDiv : noFeedbackDiv
    return(
      <div className="activity-feedback">
        { displayDiv }
      </div>
    )
  }
}
