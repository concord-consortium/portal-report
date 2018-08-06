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

    const headerSummaryClassName = css.questionPrompt + ' ' + css.mcSummary + ' ' + (showFullPrompts ? css.fullPrompt : '')
    return (
      <div className={css.activityQuestions} style={{minWidth: width, width}}>
        <div className={css.content}>
          {
            expanded && activity.get('questions').filter(q => q.get('visible')).map(q => {
              const questionIsExpaned = expandedQuestions.get(q.get('id').toString())
              const expanded = showFullPrompts || questionIsExpaned
              if (expanded) {
                const headerClassName = `${css.questionPrompt} ${css.fullPrompt}`
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
              } else {
                const headerClassName = css.questionPrompt
                return (
                  <div
                    key={q.get('id')}
                    className={headerClassName}
                    onClick={() => {
                      setQuestionExpanded(q.get('id'), true)
                    }}>
                    Q{ q.get('questionNumber') }.
                  </div>
                )
              }
            })
          }
          {
            expanded && multChoiceSummary &&
            <div className={headerSummaryClassName}>Correct</div>
          }
          {
            // Fake question prompt, just to add cell with the border.
            !expanded && <div className={`${css.questionPrompt} ${css.blankCell}`} />
          }
        </div>
      </div>
    )
  }
}
