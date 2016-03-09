import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'
import Answer from './answer'
import SelectAnswerForCompare from '../containers/select-answer-for-compare'
import ShowCompare from '../containers/show-compare'

import '../../css/answers.less'


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
          {answers.map(answer => <AnswerRow key={answer.get('studentId')} answer={answer}/>)}
        </tbody>
      </table>
    )
  }
}

const AnswerRow = ({answer}) => (
  <tr>
    <td>{answer.getIn(['student', 'name'])}</td>
    <td><Answer answer={answer}/></td>
    <td>
      {answer.get('type') !== 'NoAnswer' ?
        <div>
          <SelectAnswerForCompare answer={answer}/>
          <ShowCompare answer={answer}/>
        </div>
        :
        ''}
    </td>
  </tr>
)
