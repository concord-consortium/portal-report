import React, { PureComponent } from 'react'
import ProgressBar from './progress-bar'
import Answer from './answer'

import css from '../../../css/dashboard/activity-answers.less'

export default class ActivityAnswers extends PureComponent {
  renderMultChoiceSummary () {
    const { student, activity } = this.props
    const scoredQuestions = activity.get('questions').filter(q =>
      q.get('visible') && q.get('type') === 'Embeddable::MultipleChoice' && q.get('scored')
    )
    const correctAnswers = scoredQuestions.filter(question =>
      question.get('answers').find(answer => answer.get('studentId') === student.get('id') && answer.get('isCorrect'))
    )
    return `${correctAnswers.count()} / ${scoredQuestions.count()}`
  }

  render () {
    const { student, activity, progress, expanded, showFullAnswers, width, multChoiceSummary } = this.props
    const studentAnswers = activity.get('questions', []).filter(q => q.get('visible')).map(question => ({
      question,
      answer: question.get('answers', []).find(answer => answer.get('studentId') === student.get('id'))
    }))
    return (
      <div className={css.activityAnswers} style={{ minWidth: width, width: width }} data-cy='activityAnswers'>
        {
          !expanded && <ProgressBar progress={progress} />
        }
        {
          expanded && studentAnswers.map((data, idx) =>
            <div key={idx} className={css.answer}>
              <Answer answer={data.answer} showFullAnswer={showFullAnswers} question={data.question} />
            </div>
          )
        }
        {
          expanded && multChoiceSummary &&
          <div className={css.answer + ' ' + css.multChoiceSummary}>
            { this.renderMultChoiceSummary() }
          </div>
        }
      </div>
    )
  }
}
