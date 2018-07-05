import React, { PureComponent } from 'react'

import css from '../../../css/dashboard/activity-questions.less'

export default class ActivityQuestions extends PureComponent {
  render () {
    const { activity, expanded, showFullPrompts, width, multChoiceSummary } = this.props
    const headerClassName = css.questionPrompt + ' ' + (showFullPrompts ? css.fullPrompt : '')
    return (
      <div className={css.activityQuestions} style={{minWidth: width, width}}>
        <div className={css.content}>
          {
            expanded && activity.get('questions').filter(q => q.get('visible')).map(q =>
              <div key={q.get('id')} className={headerClassName}>
                Q{ q.get('questionNumber') }. { q.get('prompt')}
              </div>
            )
          }
          {
            expanded && multChoiceSummary &&
            <div className={headerClassName}>Multiple Choice Correct</div>
          }
          {
            // Fake question prompt, just to add cell with the border.
            !expanded && <div className={css.questionPrompt} />
          }
        </div>
      </div>
    )
  }
}
