import React, { PureComponent } from 'react'
import Answer from './answer'
import QuestionHeader from './question-header'
import SelectionCheckbox from '../../containers/report/selection-checkbox'
import Feedback from '../../containers/report/feedback'

import '../../../css/report/question.less'
import Prompt from './prompt'

export default class QuestionForStudent extends PureComponent {
  render () {
    const { question, url, student } = this.props
    const studentId = student.get('id')
    const answer = question.get('answers').filter(a => a.get('studentId') === studentId).first()
    return (
      <div className={`question for-student ${question.get('visible') ? '' : 'hidden'}`}>
        <div className='question-header'>
          <SelectionCheckbox selected={question.get('selected')} questionKey={question.get('key')} />
          <QuestionHeader question={question} url={url} />
        </div>
        <Prompt question={question} />
        <Answer answer={answer} />
        <Feedback answer={answer} student={student} question={question} htmlFor='student' />
      </div>
    )
  }
}
