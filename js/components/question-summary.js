import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'

import '../../css/question-summary.less'

@pureRender
export default class QuestionSummary extends Component {
  get prompt() {
    return this.props.question.get('prompt') || this.props.question.get('name')
  }

  get answered() {
    return this.props.question.get('answers').filter(a => a.type !== 'NoAnswer').size
  }

  get notAnswered() {
    return this.props.question.get('answers').filter(a => a.type === 'NoAnswer').size
  }

  get total() {
    return this.props.question.get('answers').size
  }

  render() {
    return (
      <div className='question-summary'>
        <div className='prompt'>
          {this.prompt}
        </div>
        <div className='stats'>
          <div><strong>Answered:</strong> {this.answered}</div>
          <div><strong>Not answered:</strong> {this.notAnswered}</div>
          <div><strong>Total:</strong> {this.total}</div>
        </div>
        <div className='clear-fix'></div>
      </div>
    )
  }
}
