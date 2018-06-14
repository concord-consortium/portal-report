import React, { PureComponent } from 'react'
import ProgressBar from './progress-bar'
import QuestionColumn from './question-column'

import css from '../../../css/dashboard/activity-column.less'

export default class ActivityColumn extends PureComponent {
  get questions () {
    const { activity } = this.props
    const sections = activity.get('children')
    const pages = sections.map(section => section.get('children')).flatten(1)
    return pages.map(page => page.get('children')).flatten(1)
  }

  render () {
    const { students, studentsProgress, expanded } = this.props
    const questions = this.questions
    const style = {}
    if (expanded) {
      style.width = (questions.count() * 120) + 'px'
    }
    return (
      <div className={css.activityColumn} style={style}>
        {
          !expanded && students.map(s =>
            <ProgressBar key={s.get('id')} progress={studentsProgress.get(s.get('id').toString())} />
          )
        }
        {
          expanded && <div className={css.questionColumns}>
            {
              this.questions.map(q =>
                <QuestionColumn key={q.get('key')} students={students} />
              )
            }
          </div>
        }
      </div>
    )
  }
}
