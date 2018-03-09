import React, { PureComponent } from 'react'
import MultipleChoiceDetails from './multiple-choice-details'
import ImageQuestionDetails from './image-question-details'
import QuestionSummary from './question-summary'
import QuestionHeader from './question-header'
import AnswersTable from '../containers/answers-table'
import SelectionCheckbox from '../containers/selection-checkbox'

import '../../css/question.less'

const QuestionComponent = {
  'Embeddable::MultipleChoice': MultipleChoiceDetails,
  'Embeddable::ImageQuestion': ImageQuestionDetails
}

export default class QuestionForClass extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      answersVisible: false
    }
    this.toggleAnswersVisibility = this.toggleAnswersVisibility.bind(this)
  }

  toggleAnswersVisibility () {
    this.setState({answersVisible: !this.state.answersVisible})
  }

  render () {
    const { question, url } = this.props
    const { answersVisible } = this.state
    const answers = question.get('answers').sortBy(a =>
      (a.getIn(['student', 'lastName']) + a.getIn(['student', 'firstName'])).toLowerCase()
    )

    return (
      <div>
        <div className={`question ${question.get('visible') ? '' : 'hidden'}`}>
          <div className='question-header'>
            <SelectionCheckbox selected={question.get('selected')} questionKey={question.get('key')} />
            <QuestionHeader question={question} url={url} />
            <a className='answers-toggle' onClick={this.toggleAnswersVisibility}>
              {answersVisible ? 'Hide responses' : 'Show responses'}
            </a>
          </div>
          <QuestionSummary question={question} answers={answers} />
          <QuestionDetails question={question} />
          {answersVisible ? <AnswersTable question={question} answers={answers} /> : ''}
        </div>
      </div>
    )
  }
}

const QuestionDetails = ({question}) => {
  const QComponent = QuestionComponent[question.get('type')]
  if (!QComponent) {
    return <span />
  }
  return <QComponent question={question} />
}
