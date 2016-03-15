import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'
import Answer from './answer'
import { CompareAnswerCheckboxContainer } from '../containers/compare-answer'
import ShowCompareContainer from '../containers/show-compare'

import '../../css/answers-table.less'

@pureRender
export default class AnswersTable extends Component {
  render() {
    const { answers, hidden } = this.props
    return (
      <table className={`answers-table ${hidden ? 'hidden' : ''}`}>
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
    <td className='select-answer-column'>
      {answer.get('type') !== 'NoAnswer' ?
        <div>
          <CompareAnswerCheckboxContainer answer={answer}/>
          <ShowCompareContainer answer={answer}/>
        </div>
        :
        ''}
    </td>
  </tr>
)
