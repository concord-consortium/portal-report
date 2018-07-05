import React, { PureComponent } from 'react'
import { Map } from 'immutable'

import css from '../../../css/dashboard/multiple-choice-answer.less'

const CORRECT_ICON = 'icomoon-checkmark ' + css.correct
const INCORRECT_ICON = 'icomoon-cross ' + css.incorrect
const SELECTED_ICON = 'icomoon-checkmark2'
const NOT_SELECTED_ICON = 'icomoon-radio-unchecked'

export class Choice extends PureComponent {
  get icon () {
    const { choice, selected, correctAnswerDefined } = this.props
    const isCorrect = choice.get('isCorrect')
    if (correctAnswerDefined && selected && isCorrect) {
      return CORRECT_ICON
    } else if (correctAnswerDefined && selected && !isCorrect) {
      return INCORRECT_ICON
    } else if (selected) {
      return SELECTED_ICON
    }
    return NOT_SELECTED_ICON
  }

  get contentStyling () {
    const { choice, selected, correctAnswerDefined } = this.props
    const isCorrect = choice.get('isCorrect')
    if (correctAnswerDefined && isCorrect) {
      return css.correct
    } else if (correctAnswerDefined && selected && !isCorrect) {
      return css.incorrect
    } else if (selected) {
      return css.selected
    }
    // No special styling otherwise.
    return ''
  }

  get label () {
    const { choice, selected } = this.props
    const isCorrect = choice.get('isCorrect')
    if (selected === true) {
      return 'student\'s response'
    } else if (!selected && isCorrect === true) {
      return 'correct response'
    }
    return ''
  }

  render () {
    const { choice } = this.props
    return (
      <div className={css.choice}>
        <i className={this.icon} />
        <div className={css.choiceContent + ' ' + this.contentStyling}>
          <div className={css.choiceText}>
            { choice.get('choice') }
          </div>
          <div className={css.label}>
            { this.label }
          </div>
        </div>
      </div>
    )
  }
}

export default class MultipleChoiceAnswer extends PureComponent {
  renderIcon () {
    const { answer, question } = this.props
    let icon
    if (!question.get('scored')) {
      // Undefined as there's no correct or incorrect choice defined.
      icon = SELECTED_ICON
    } else {
      icon = answer.get('isCorrect') ? CORRECT_ICON : INCORRECT_ICON
    }
    return (
      <div className={css.icon}>
        <i className={icon} />
      </div>
    )
  }

  renderFullAnswer () {
    const { question, answer } = this.props
    const choices = question.get('choices')
    const studentChoices = answer.get('answer')
    return (
      <div>
        {
          choices.map(choice =>
            <Choice key={choice.get('id')} choice={choice} correctAnswerDefined={question.get('scored')}
              selected={studentChoices.some(studentChoice => studentChoice.get('id') === choice.get('id'))}
            />
          )
        }
      </div>
    )
  }

  render () {
    const { showFullAnswer } = this.props
    return (
      <div className={css.multipleChoiceAnswer}>
        { showFullAnswer ? this.renderFullAnswer() : this.renderIcon() }
      </div>
    )
  }
}

MultipleChoiceAnswer.defaultProps = {
  answer: Map(),
  question: Map(),
  showFullAnswer: false
}
