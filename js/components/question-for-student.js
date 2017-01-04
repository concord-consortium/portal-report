import React, { PureComponent } from 'react'
import Answer from './answer'
import MaybeLink from './maybe-link'
import SelectionCheckbox from '../containers/selection-checkbox'
import Feedback from '../containers/feedback'

import '../../css/question.less'
import Prompt from './prompt'

export default class QuestionForStudent extends PureComponent {

  renderQuestionHeader() {
    const { question, url } = this.props
    return (
      <span className="page-link">
        <MaybeLink url={url}>
          <span> Question #{question.get('questionNumber')} </span>
        </MaybeLink>
      </span>
    )
  }

  render() {
    const { question, student } = this.props
    const studentId = student.get('id')
    const answer = question.get('answers').filter(a => a.get('studentId') === studentId).first()
    return (
      <div className={`question for-student ${question.get('visible') ? '' : 'hidden'}`}>
        <div className='question-header'>
          <SelectionCheckbox selected={question.get('selected')} questionKey={question.get('key')} />
          {this.renderQuestionHeader()}
        </div>
        <Prompt question={question}/>
        <Answer answer={answer}/>
        <Feedback answer={answer} question={question} htmlFor="student"/>
      </div>
    )
  }
}
