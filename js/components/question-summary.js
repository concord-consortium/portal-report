import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'

import '../../css/question-summary.less'

@pureRender
export default class QuestionSummary extends Component {
  get prompt() {
    return this.props.questionJSON.prompt || this.props.questionJSON.name
  }

  get answered() {
    return this.props.questionJSON.children.filter(a => a.type !== 'NoAnswer').length
  }

  get notAnswered() {
    return this.props.questionJSON.children.filter(a => a.type === 'NoAnswer').length
  }

  get total() {
    return this.props.questionJSON.children.length
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
