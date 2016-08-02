import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'
import Prompt from './prompt'
import FeedbackPanel from './feedback-panel'

import '../../css/question-summary.less'

@pureRender
export default class QuestionSummary extends Component {



  get answered() {
    return this.props.question.get('answers').toJS().filter(a => a.type !== 'NoAnswer').length
  }

  get notAnswered() {
    return this.props.question.get('answers').toJS().filter(a => a.type === 'NoAnswer').length
  }

  get total() {
    return this.props.question.get('answers').size
  }

  render() {
    const { question } = this.props
    return (
      <div className='question-summary'>
        <Prompt question={question} />
        <div className='stats'>
          <div><strong>Answered:</strong> {this.answered}</div>
          <div><strong>Not answered:</strong> {this.notAnswered}</div>
          <div><strong>Total:</strong> {this.total}</div>
          <FeedbackPanel question={this.props.question}/>
        </div>
        <div className='clear-fix'></div>
      </div>
    )
  }
}
