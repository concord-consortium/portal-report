import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'
import Answer from './answer'

import '../../css/question.less'

@pureRender
export default class QuestionForStudent extends Component {
  constructor(props) {
    super(props)
    this.handleCheckboxChange = this.handleCheckboxChange.bind(this)
  }

  handleCheckboxChange(event) {
    const { question, onSelectChange } = this.props
    onSelectChange(question.get('key'), event.target.checked)
  }


  get prompt() {
    // see discussion here: https://facebook.github.io/react/tips/dangerously-set-inner-html.html
    const prompt = this.props.question.get('prompt') || this.props.question.get('name')
    return {__html: prompt}
  }

  render() {
    const { question, student } = this.props
    const studentId = student.get('id')
    const answer = question.get('answers').filter(a => a.get('studentId') === studentId).first()
    return (
      <div className={`question for-student ${question.get('visible') ? '' : 'hidden'}`}>
        <div className='question-header'>
          <input type='checkbox' checked={question.get('selected')} onChange={this.handleCheckboxChange}/>
          Question #{question.get('questionNumber')}
        </div>
        <div className='prompt' dangerouslySetInnerHTML={this.prompt}/>
        <Answer answer={answer}/>
      </div>
    )
  }
}
