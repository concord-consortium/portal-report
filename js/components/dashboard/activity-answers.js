import React, { PureComponent } from 'react'
import ProgressBar from './progress-bar'
import Answer from './answer'

import css from '../../../css/dashboard/activity-answers.less'

export default class ActivityAnswers extends PureComponent {
  render () {
    const { student, activity, progress, expanded, showFullAnswers, width } = this.props
    const studentAnswers = activity.get('questions').map(question => ({
      question,
      answer: question.get('answers').find(answer => answer.get('studentId') === student.get('id'))
    }))
    return (
      <div className={css.activityAnswers} style={{ minWidth: width, width: width }}>
        {
          !expanded && <ProgressBar progress={progress} />
        }
        {
          expanded && studentAnswers.map((data, idx) =>
            <Answer key={idx} answer={data.answer} showFullAnswer={showFullAnswers} question={data.question} />
          )
        }
      </div>
    )
  }
}
