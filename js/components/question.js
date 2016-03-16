import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'
import QuestionForClass from './question-for-class'
import QuestionForStudent from './question-for-student'

@pureRender
export default class Question extends Component {
  render() {
    const { question, number, reportFor, onSelectChange } = this.props
    if (reportFor === 'class') {
      return <QuestionForClass question={question} number={number} onSelectChange={onSelectChange}/>
    } else {
      return <QuestionForStudent question={question} student={reportFor} number={number} onSelectChange={onSelectChange}/>
    }
  }
}
