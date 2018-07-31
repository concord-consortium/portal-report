import React, { PureComponent } from 'react'
import striptags from 'striptags'

import css from '../../../css/dashboard/activity-questions.less'

export default class ActivityQuestions extends PureComponent {
  render () {
    const {
      activity, expanded, showFullPrompts,
      width, multChoiceSummary, setQuestionExpanded,
      expandedQuestions
    } = this.props

    const headerSummaryClassName = css.questionPrompt + ' ' + (showFullPrompts ? css.fullPrompt : '')
    return (
      <div className={css.activityQuestions} style={{minWidth: width, width}}>
        <div className={css.content}>
          {
            expanded && activity.get('questions').filter(q => q.get('visible')).map(q => {
              const questionIsExpaned = expandedQuestions.get(q.get('id').toString())
              const expanded = showFullPrompts || questionIsExpaned
              const headerClassName = css.questionPrompt + ' ' + (expanded ? css.fullPrompt : '')
              return (
                <div
                  key={q.get('id')}
                  className={headerClassName}
                  onClick={() => {
                    setQuestionExpanded(q.get('id'), true)
                  }}>
                  Q{ q.get('questionNumber') }. { striptags(q.get('prompt')) }
                </div>
              )
            })
          }
          {
            expanded && multChoiceSummary &&
            <div className={headerSummaryClassName}>Multiple Choice Correct</div>
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
