import React, { PureComponent } from 'react'

import css from '../../../css/dashboard/student-name.less'

export default class StudentName extends PureComponent {
  constructor (props) {
    super(props)
    this.onStudentNameClick = this.onStudentNameClick.bind(this)
  }

  onStudentNameClick () {
    const { student, expanded, setStudentExpanded } = this.props
    setStudentExpanded(student.get('id'), !expanded)
  }

  render () {
    const { student, expanded } = this.props
    return (
      <div className={css.studentName + ' ' + (expanded ? css.expanded : '')} onClick={this.onStudentNameClick}>
        <div className={css.content}>
          { student.get('lastName') }, { student.get('firstName')}
        </div>
      </div>
    )
  }
}
