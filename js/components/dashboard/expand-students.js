import React, { PureComponent } from 'react'
import { Map, List } from 'immutable'
import { SET_STUDENTS_EXPANDED } from '../../actions/dashboard'
import Button from '../report/button'

import css from '../../../css/dashboard/expand-students.less'

export default class ExpandStudents extends PureComponent {
  onSetStudentsExpanded (value) {
    const { setStudentsExpanded, students } = this.props
    setStudentsExpanded(students.map(student => student.get('id')), value)
  }

  render () {
    const { expandedStudents } = this.props
    const anyStudentsExpanded = expandedStudents.some((isExpanded) => isExpanded)
    return (
      <div className={css.expandStudents}>
        <div className={css.title} />
        <div className={css.buttonCell} >
          <Button onClick={() => this.onSetStudentsExpanded(!anyStudentsExpanded)} className={css.button}>
            {anyStudentsExpanded ? 'Close Students' : 'Open Students'}
          </Button>
        </div>
      </div>
    )
  }
}

ExpandStudents.defaultProps = {
  expandedStudents: Map(),
  students: List()
}