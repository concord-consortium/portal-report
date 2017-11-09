import React, { PureComponent } from 'react'
import studentReporturl from '../util/student-report-url'


export default class StudentReportLink extends PureComponent {
  constructor(props) {
    super(props)
  }

  render() {
    const {student, started} = this.props
    const student_id = student.get('id')
    const name = student.get('name')
    const link = studentReporturl(student_id)

    const linkToWork = (
      <a href={link} target="_blank">
        Open {name}'s report
      </a>
    )

    const noLinkToWork = (
      <span>
        {name} hasn't started yet
      </span>
    )

    if(started) {
      return linkToWork
    }

    return noLinkToWork
  }
}
