import React, { Component } from 'react'
import { StickyContainer, Sticky } from 'react-sticky'
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
      answersVisible: false,
      isSticky: false
    }
    this.toggleAnswersVisibility = this.toggleAnswersVisibility.bind(this)
    this.handleCheckboxChange = this.handleCheckboxChange.bind(this)
    this.handleStickyStateChange = this.handleStickyStateChange.bind(this)
  }

  toggleAnswersVisibility() {
    this.setState({answersVisible: !this.state.answersVisible})
  }

  handleCheckboxChange(event) {
    const { question, onSelectChange } = this.props
    onSelectChange(question.get('key'), event.target.checked)
  }

  handleStickyStateChange(isSticky) {
    this.setState({isSticky: isSticky})
  }

  renderQuestionHeader() {
    const { question, investigationName, activityName, sectionName, pageName } = this.props
    const { isSticky } = this.state
    if (isSticky) {
      // the sectionName is not used for now
      return <span>{[investigationName, activityName, `Page: ${pageName}`].join(' › ')} › Question #{question.get('questionNumber')}</span>
    }
    else {
      return <span>Question #{question.get('questionNumber')}</span>
    }
  }

  render() {
    const { question } = this.props
    const { answersVisible } = this.state
    return (
      <StickyContainer>
        <div className={`question ${question.get('visible') ? '' : 'hidden'}`}>
          <Sticky className="question-header" onStickyStateChange={this.handleStickyStateChange}>
            <input type='checkbox' checked={question.get('selected')} onChange={this.handleCheckboxChange}/>
            { this.renderQuestionHeader() }
            <a className='answers-toggle' onClick={this.toggleAnswersVisibility}>
              {answersVisible ? 'Hide responses' : 'Show responses'}
            </a>
          </Sticky>
          <QuestionSummary question={question}/>
          <QuestionDetails question={question}/>
          {answersVisible ? <AnswersTable answers={question.get('answers')}/> : ''}
        </div>
      </StickyContainer>
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
