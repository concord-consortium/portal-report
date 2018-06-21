import React, { PureComponent } from 'react'
import ProgressBar from './progress-bar'
import GenericAnswer from './generic-answer'

import css from '../../../css/dashboard/activity-answers.less'

export default class ActivityAnswers extends PureComponent {
  render () {
    const { student, activity, progress, expanded, showFullAnswers, width } = this.props
    const studentAnswers = activity.get('questions').map(question =>
      question.get('answers').find(answer => answer.get('studentId') === student.get('id'))
    )
    return (
      <div className={css.activityAnswers} style={{ minWidth: width, width: width }}>
        {
          !expanded && <ProgressBar progress={progress} />
        }
        {
          expanded && studentAnswers.map((a, idx) =>
            <GenericAnswer key={idx} answer={a} />
          )
        }
      </div>
    )
  }
}
