import React, { PureComponent } from 'react'

import css from '../../../css/dashboard/activity-questions.less'

export default class ActivityQuestions extends PureComponent {
  render () {
    const { activity, expanded, showFullPrompts, width } = this.props
    return (
      <div className={css.activityQuestions} style={{minWidth: width, width}}>
        <div className={css.content}>
          {
            expanded && activity.get('questions').map(q =>
              <div key={q.get('id')} className={css.questionPrompt + ' ' + (showFullPrompts ? css.fullPrompt : '')}>
                Q{ q.get('questionNumber') }. { q.get('prompt')}
              </div>
            )
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
