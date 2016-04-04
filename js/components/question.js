import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'
import QuestionForClass from './question-for-class'
import QuestionForStudent from './question-for-student'

@pureRender
export default class Question extends Component {
  render() {
    const { question, reportFor, onSelectChange, investigationName, activityName, sectionName, pageName } = this.props
    if (reportFor === 'class') {
      return <QuestionForClass question={question}onSelectChange={onSelectChange} investigationName={investigationName} activityName={activityName} sectionName={sectionName} pageName={pageName} />
    } else {
      return <QuestionForStudent question={question} student={reportFor} onSelectChange={onSelectChange}/>
    }
  }
}
