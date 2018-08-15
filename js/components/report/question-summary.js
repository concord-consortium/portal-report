import React, { PureComponent } from 'react'
import Prompt from './prompt'
import FeedbackPanel from '../../containers/report/feedback-panel'

import '../../../css/report/question-summary.less'

export default class QuestionSummary extends PureComponent {
  get answered () {
    return this.props.answers.toJS().filter(a => a.type !== 'NoAnswer').length
  }

  get notAnswered () {
    return this.props.answers.toJS().filter(a => a.type === 'NoAnswer').length
  }

  get total () {
    return this.props.answers.size
  }

  render () {
    const { question, showFeedback } = this.props
    const notAnsweredDiv = (<div><strong>Not answered:</strong> {this.notAnswered}</div>)

    // These aren't stats have been removed, but its possibly they will go back in.
    // const answeredDiv = (<div><strong>Answered:</strong> {this.answered}</div>)
    // const totalDiv = (<div><strong>Total:</strong> {this.total}</div>)
    return (
      <div className='question-summary'>
        <Prompt question={question} />
        <div className='stats'>

          {this.notAnswered > 0 ? notAnsweredDiv : ''}
          { showFeedback
            ? <FeedbackPanel question={this.props.question} answers={this.props.answers} />
            : ''
          }
        </div>
        <div className='clear-fix' />
      </div>
    )
  }
}

QuestionSummary.defaultProps = {
  showFeedback: true
}
