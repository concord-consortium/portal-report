import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'
import Button from './button'
import OpenResponseAnswer from './open-response-answer'
import MultipleChoiceAnswer from './multiple-choice-answer'
import ImageAnswer from './image-answer'
import IframeAnswer from './iframe-answer'
import NoAnswer from './no-answer'

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
    const { answers, hidden } = this.props
    return (
      <table className={`answers ${hidden ? 'hidden' : ''}`}>
        <tbody>
          <tr>
            <th className='student-header'>Student</th>
            <th>Response</th>
            <th className='select-header'>Select</th>
          </tr>
          {answers.map(answer => <AnswerRow key={answer.studentId} answer={answer}/>)}
        </tbody>
      </table>
    )
  }
}

const AnswerRow = ({answer}) => (
  <tr>
    <td>{answer.student.name}</td>
    <td><AnswerBody answer={answer}/></td>
    <td>
      {answer.type !== 'NoAnswer' ?
        <div>
          <input type='checkbox'/>
          <Button className='select-answer'>Compare/project</Button>
        </div>
        :
        ''}
    </td>
  </tr>
)

const AnswerBody = ({answer}) => {
  const AComponent = AnswerComponent[answer.type]
  if (!AComponent) {
    return <div>Answer type not supported.</div>
  }
  return <AComponent answer={answer}/>
}
