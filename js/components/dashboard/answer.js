import React, { PureComponent } from 'react'
import GenericAnswer from './generic-answer'
import MultipleChoiceAnswer from './multiple-choice-answer'

import css from '../../../css/dashboard/answer.less'

const NoAnswer = () => null // nothing to render

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
    const AComponent = (answer && answer.get('submitted')) ? AnswerComponent[answer.get('type')] : NoAnswer
    return (
      <div className={css.answer}>
        <AComponent answer={answer} showFullAnswer={showFullAnswer} question={question} />
      </div>
    )
  }
}
