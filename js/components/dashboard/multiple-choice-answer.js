import React, { PureComponent } from 'react'

import css from '../../../css/dashboard/multiple-choice-answer.less'

const CORRECT_ICON = 'icomoon-checkmark ' + css.correct
const INCORRECT_ICON = 'icomoon-cross ' + css.incorrect
const SELECTED_ICON = 'icomoon-checkmark2'
const NOT_SELECTED_ICON = 'icomoon-radio-unchecked'

export class Choice extends PureComponent {
  get icon () {
    const { choice, selected } = this.props
    const isCorrect = choice.get('isCorrect')
    if (selected && isCorrect === true) {
      return CORRECT_ICON
    } else if (selected && isCorrect === false) {
      return INCORRECT_ICON
    } else if (selected) {
      // Undefined as there's no correct or incorrect choice defined.
      return SELECTED_ICON
    }
    return NOT_SELECTED_ICON
  }

  get contentStyling () {
    const { choice, selected } = this.props
    const isCorrect = choice.get('isCorrect')
    if (isCorrect === true) {
      return css.correct
    } else if (selected && isCorrect === false) {
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
    const { answer } = this.props
    const isCorrect = answer.get('isCorrect')
    let icon
    if (isCorrect === true) {
      icon = CORRECT_ICON
    } else if (isCorrect === false) {
      icon = INCORRECT_ICON
    } else if (isCorrect === undefined || isCorrect === null) {
      // Undefined as there's no correct or incorrect choice defined.
      icon = SELECTED_ICON
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
            <Choice key={choice.get('id')} choice={choice} selected={!!studentChoices.find(studentChoice => studentChoice.get('id') === choice.get('id'))} />
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
