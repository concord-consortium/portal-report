import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'
import Answer from './answer'
import SelectionCheckbox from '../containers/selection-checkbox'
import Feedback from '../containers/feedback'

import '../../css/question.less'
import Prompt from './prompt'

@pureRender
export default class QuestionForStudent extends Component {

  render() {
    const { question, student } = this.props
    const studentId = student.get('id')
    const answer = question.get('answers').filter(a => a.get('studentId') === studentId).first()
    return (
      <div className={`question for-student ${question.get('visible') ? '' : 'hidden'}`}>
        <div className='question-header'>
          <SelectionCheckbox selected={question.get('selected')} questionKey={question.get('key')} />
          Question #{question.get('questionNumber')}
        </div>
        <Prompt question={question} />
        <Answer answer={answer}/>
        <Feedback answer={answer} question={question} for="student"/>
      </div>
    )
  }
}
