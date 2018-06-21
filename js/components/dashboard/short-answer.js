import React, { PureComponent } from 'react'

import css from '../../../css/dashboard/short-answer.less'

export default class ShortAnswer extends PureComponent {
  render () {
    const { answer, showFullAnswer } = this.props
    let answerText = ''
    if (answer) {
      // TODO: Show an actual icon and answer text
      answerText = showFullAnswer ? 'randomized answer '.repeat(Math.random() * 50) : '[ans icon]'
    } else {
      answerText = showFullAnswer ? 'No Answer' : ''
    }
    return (
      <div className={css.shortAnswer + ' ' + (showFullAnswer ? css.fullAnswer : '')}>
        {
          answerText
        }
      </div>
    )
  }
}
