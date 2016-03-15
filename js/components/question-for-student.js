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

  render() {
    const { question, student, number } = this.props
    const studentId = student.get('id')
    const answer = question.get('responses').filter(a => a.get('studentId') === studentId).first()
    return (
      <div className={`question ${question.get('visible') ? '' : 'hidden'}`}>
        <div className='question-header'>
          <input type='checkbox' checked={question.get('selected')} onChange={this.handleCheckboxChange}/>
          Question #{number}
        </div>
        <div className='prompt'>{question.get('prompt') || question.get('name')}</div>
        <Answer answer={answer}/>
      </div>
    )
  }
}
