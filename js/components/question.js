import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'
import MultipleChoiceDetails from './multiple-choice-details'
import ImageQuestionDetails from './image-question-details'
import QuestionSummary from './question-summary'
import AnswersTableContainer from '../containers/answers-table'

import '../../css/question.less'

const QuestionComponent = {
  'Embeddable::MultipleChoice': MultipleChoiceDetails,
  'Embeddable::ImageQuestion': ImageQuestionDetails
}

@pureRender
export default class Question extends Component {
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

  handleCheckboxChange() {
    const { questionJSON, selected, onSelectChange } = this.props
    onSelectChange(questionJSON.key, !selected)
  }

  render() {
    const { questionJSON, hidden, number, selected } = this.props
    const { answersVisible } = this.state
    return (
      <div className={`question ${hidden ? 'hidden' : ''}`}>
        <div className='question-header'>
          <h5>
            <input type='checkbox' checked={selected} onChange={this.handleCheckboxChange}/>
            Question #{number}
            <a className='answers-toggle' onClick={this.toggleAnswersVisibility}>
              {answersVisible ? 'Hide responses' : 'Show responses'}
            </a>
          </h5>
        </div>
        <QuestionSummary questionJSON={questionJSON}/>
        <div className='details-container'>
          <QuestionDetails questionJSON={questionJSON}/>
        </div>
        {answersVisible ? <AnswersTableContainer answersJSON={questionJSON.children}/> : ''}
      </div>
    )
  }
}

const QuestionDetails = ({questionJSON}) => {
  const QComponent = QuestionComponent[questionJSON.type]
  if (!QComponent) {
    return <span></span>
  }
  return <QComponent questionJSON={questionJSON}/>
}
