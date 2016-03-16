import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'
import MultipleChoiceDetails from './multiple-choice-details'
import ImageQuestionDetails from './image-question-details'
import QuestionSummary from './question-summary'
import AnswersTable from './answers-table'

import '../../css/question.less'

const QuestionComponent = {
  'Embeddable::MultipleChoice': MultipleChoiceDetails,
  'Embeddable::ImageQuestion': ImageQuestionDetails
}

@pureRender
export default class QuestionForClass extends Component {
  constructor(props) {
    super(props)
    this.state = {
      answersVisible: false
    }
    this.toggleAnswersVisibility = this.toggleAnswersVisibility.bind(this)
    this.handleCheckboxChange = this.handleCheckboxChange.bind(this)
  }

  toggleAnswersVisibility() {
    this.setState({answersVisible: !this.state.answersVisible})
  }

  handleCheckboxChange(event) {
    const { question, onSelectChange } = this.props
    onSelectChange(question.get('key'), event.target.checked)
  }

  render() {
    const { question, number } = this.props
    const { answersVisible } = this.state
    return (
      <div className={`question ${question.get('visible') ? '' : 'hidden'}`}>
        <div className='question-header'>
          <input type='checkbox' checked={question.get('selected')} onChange={this.handleCheckboxChange}/>
          Question #{number}
          <a className='answers-toggle' onClick={this.toggleAnswersVisibility}>
            {answersVisible ? 'Hide responses' : 'Show responses'}
          </a>
        </div>
        <QuestionSummary question={question}/>
        <QuestionDetails question={question}/>
        {answersVisible ? <AnswersTable answers={question.get('responses')}/> : ''}
      </div>
    )
  }
}

const QuestionDetails = ({question}) => {
  const QComponent = QuestionComponent[question.get('type')]
  if (!QComponent) {
    return <span></span>
  }
  return <QComponent question={question}/>
}
