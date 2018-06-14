import React, { PureComponent } from 'react'

import css from '../../../css/dashboard/question-column.less'

export default class QuestionColumn extends PureComponent {
  render () {
    const { students } = this.props

    return (
      <div className={css.questionColumn}>
        {
          students.map(s =>
            <div className={css.answerCell} key={s.get('id')}> X </div>
          )
        }
      </div>
    )
  }
}
