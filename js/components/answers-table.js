import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'
import Button from './button'
import OpenResponseAnswer from './open-response-answer'
import MultipleChoiceAnswer from './multiple-choice-answer'
import ImageAnswer from './image-answer'
import IframeAnswer from './iframe-answer'
import NoAnswer from './no-answer'
import StudentName from '../containers/student-name'

import '../../css/answers.less'

const AnswerComponent = {
  'Embeddable::OpenResponse': OpenResponseAnswer,
  'Embeddable::MultipleChoice': MultipleChoiceAnswer,
  'Embeddable::ImageQuestion': ImageAnswer,
  'Embeddable::Iframe': IframeAnswer,
  'NoAnswer': NoAnswer
}

@pureRender
export default class AnswersTable extends Component {
  render() {
    const { answersJSON, hidden } = this.props
    return (
      <table className={`answers ${hidden ? 'hidden' : ''}`}>
        <tbody>
          <tr>
            <th className='student-header'>Student</th>
            <th>Response</th>
            <th className='select-header'>Select</th>
          </tr>
          {answersJSON.map(answerJSON => <AnswerRow key={answerJSON.student_id} answerJSON={answerJSON}/>)}
        </tbody>
      </table>
    )
  }
}

const AnswerRow = ({answerJSON}) => (
  <tr>
    <td><StudentName id={answerJSON.student_id}/></td>
    <td><AnswerBody answerJSON={answerJSON}/></td>
    <td>
      {answerJSON.type !== 'NoAnswer' ?
        <div>
          <input type='checkbox'/>
          <Button className='select-answer'>Compare/project</Button>
        </div>
        :
        ''}
    </td>
  </tr>
)

const AnswerBody = ({answerJSON}) => {
  const AComponent = AnswerComponent[answerJSON.type]
  if (!AComponent) {
    return <div>Answer type not supported.</div>
  }
  return <AComponent answerJSON={answerJSON}/>
}
