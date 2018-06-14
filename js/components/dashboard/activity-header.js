import React, { PureComponent } from 'react'

import css from '../../../css/dashboard/activity-header.less'

const COLLAPSED_QUESTION_WIDTH = 120 // px

export default class ActivityHeader extends PureComponent {
  constructor (props) {
    super(props)
    this.onActivityNameClick = this.onActivityNameClick.bind(this)
  }

  get questions () {
    const { activity } = this.props
    const sections = activity.get('children')
    const pages = sections.map(section => section.get('children')).flatten(1)
    return pages.map(page => page.get('children')).flatten(1)
  }

  onActivityNameClick () {
    const { activity, expanded, setActivityExpanded } = this.props
    setActivityExpanded(activity.get('id'), !expanded)
  }

  render () {
    const { activity, expanded } = this.props
    const questions = this.questions
    const questionsCount = questions.count()
    const style = {}
    if (expanded) {
      style.width = (questionsCount * COLLAPSED_QUESTION_WIDTH) + 'px'
    }
    return (
      <div className={css.activityHeader} style={style}>
        <div className={css.activityName} onClick={this.onActivityNameClick}>{ activity.get('name') }</div>
        <div className={css.questions}>
          {
            expanded && this.questions.map(q =>
              <div key={q.get('id')} className={css.questionPrompt}>
                Q{ q.get('questionNumber') }. { q.get('prompt')}
              </div>
            )
          }
          {
            // Fake question prompt, just to add border.
            !expanded && <div className={css.questionPrompt} />
          }
        </div>
      </div>
    )
  }
}
