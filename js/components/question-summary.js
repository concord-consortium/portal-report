import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'

import '../../css/question-summary.less'

@pureRender
export default class QuestionSummary extends Component {
  get prompt() {
    const prompt = this.props.question.get('prompt') || this.props.question.get('name')
    // see discussion here: https://facebook.github.io/react/tips/dangerously-set-inner-html.html
    // Note that prompts have had tags removed on the portal side. HTML entities are passed through though,
    // (eg: `&deg;`) and we would like to render them here.
    return {__html: prompt}
  }

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
    return (
      <div className='question-summary'>
        <div className='prompt' dangerouslySetInnerHTML={this.prompt}/>
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
