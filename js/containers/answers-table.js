import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'
import Answer from '../components/answer'
import { CompareAnswerCheckboxContainer } from './compare-answer'
import ShowCompareContainer from './show-compare'
import { connect } from 'react-redux'

import '../../css/answers-table.less'

@pureRender
class AnswersTable extends Component {

  getLatestFeedback(answer) {
    const feedbackKey = answer.get('feedbacks') && answer.get('feedbacks').last()
    return this.props.feedbacks.get(feedbackKey)
  }

  render() {
    const {question, answers, hidden} = this.props
    const getLatestFeedback = this.getLatestFeedback.bind(this)
    const anonymous = this.props.anonymous
    const scoreEnabled = (!anonymous) && question.get("scoreEnabled")
    const feedbackEnabled = (!anonymous) && question.get("feedbackEnabled")

    const feedbackTH = feedbackEnabled ?  <th>Feedback</th> : null
    const scoreTH = scoreEnabled ?  <th>Score</th> : null
    return (
      <table className={`answers-table ${hidden ? 'hidden' : ''}`}>
        <tbody>
          <tr>
            <th className='student-header'>Student</th>
            <th>Response</th>
            {feedbackTH}
            {scoreTH}
            <th className='select-header'>Select</th>
          </tr>
          {answers.map(function(answer) {
              const feedback = getLatestFeedback(answer)
              return (<AnswerRow
                key={answer.get('studentId')}
                answer={answer}
                feedback={feedback}
                showFeedback={feedbackEnabled}
                showScore={scoreEnabled}
              />)
            }
          )}
        </tbody>
      </table>
    )
  }
}

function AnswerRow ({answer, feedback, showScore, showFeedback}) {
  const hasAnswer =  answer.get("type") !== "NoAnswer"
  const score = feedback && feedback.get("score")
  const textFeedback = feedback && feedback.get("feedback")
  const scoreTD = showScore ? <td className="score">{score}</td> : null
  const feedbackTD = showFeedback ? <td className="feedback">{textFeedback}</td> : null
  const compareDIV =  hasAnswer ?
    <div>
      <CompareAnswerCheckboxContainer answer={answer}/>
      <ShowCompareContainer answer={answer}/>
    </div>
    : ""

   return (
      <tr>
        <td>{answer.getIn(["student", "name"])}</td>
        <td> <Answer answer={answer}/> </td>
        {feedbackTD}
        {scoreTD}
        <td className="select-answer-column">
          {compareDIV}
        </td>
      </tr>
    )
}


function mapStateToProps(state) {
  return {
    feedbacks: state.get("feedbacks"),
    anonymous: state.getIn(["report","anonymous"])
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(AnswersTable)
