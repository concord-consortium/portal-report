import React, { PureComponent } from 'react'

import css from '../../../css/dashboard/answer-cell.less'

export default class AnswerCell extends PureComponent {
  render () {
    const { answer, showFullAnswer } = this.props
    let answerText = ''
    if (answer) {
      answerText = showFullAnswer ? 'randomized answer '.repeat(Math.random() * 50) : '[ans icon]'
    } else {
      answerText = showFullAnswer ? 'No Answer' : ''
    }
    return (
      <div className={css.answerCell + ' ' + (showFullAnswer ? css.fullAnswer : '')}>
        {
          answerText
        }
      </div>
    )
  }
}
