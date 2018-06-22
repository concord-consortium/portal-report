import React, { PureComponent } from 'react'
import { Map } from 'immutable'
import MultipleChoiceAnswer from './multiple-choice-answer'

import css from '../../../css/dashboard/answer.less'

export const NoAnswer = () => null

export const GenericAnswer = () => (
  <div style={{textAlign: 'center'}}>
    <i className='icomoon-radio-unchecked' />
  </div>
)

const AnswerComponent = {
  'Embeddable::MultipleChoice': MultipleChoiceAnswer,
  'Embeddable::OpenResponse': GenericAnswer,
  'Embeddable::ImageQuestion': GenericAnswer,
  'Embeddable::Iframe': GenericAnswer,
  'NoAnswer': NoAnswer
}

export default class Answer extends PureComponent {
  render () {
    const { answer, showFullAnswer, question } = this.props
    let AComponent = NoAnswer
    if (answer && answer.get('submitted')) {
      AComponent = AnswerComponent[answer.get('type')] || GenericAnswer
    }
    return (
      <div className={css.answer}>
        <AComponent answer={answer} showFullAnswer={showFullAnswer} question={question} />
      </div>
    )
  }
}

Answer.defaultProps = {
  answer: Map(),
  question: Map(),
  showFullAnswer: false
}
