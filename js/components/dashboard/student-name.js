import React, { PureComponent } from 'react'
import { Map } from 'immutable'

import css from '../../../css/dashboard/student-name.less'

export default class StudentName extends PureComponent {
  constructor (props) {
    super(props)
    this.onStudentNameClick = this.onStudentNameClick.bind(this)
  }

  onStudentNameClick () {
    const { student, studentExpanded, setStudentExpanded } = this.props
    setStudentExpanded(student.get('id'), !studentExpanded)
  }

  render () {
    const { student, expanded } = this.props
    return (
      <div className={css.studentName + ' ' + (expanded ? css.expanded : '')} onClick={this.onStudentNameClick} data-cy='studentName'>
        <div className={css.content}>
          { student.get('lastName') }, { student.get('firstName')}
        </div>
      </div>
    )
  }
}

StudentName.defaultProps = {
  student: Map()
}
