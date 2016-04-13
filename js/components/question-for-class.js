import React, { Component } from 'react'
import { StickyContainer, Sticky } from 'react-sticky'
import pureRender from 'pure-render-decorator'
import MultipleChoiceDetails from './multiple-choice-details'
import ImageQuestionDetails from './image-question-details'
import QuestionSummary from './question-summary'
import AnswersTable from './answers-table'
import SelectionCheckbox from '../containers/selection-checkbox'

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
    this.handleStickyStateChange = this.handleStickyStateChange.bind(this)
  }

  toggleAnswersVisibility() {
    this.setState({answersVisible: !this.state.answersVisible})
  }

  handleStickyStateChange(isSticky) {
    this.setState({isSticky: isSticky})
  }

  renderQuestionHeader() {
    const { question, investigationName, activityName, sectionName, pageName } = this.props
    //const { isSticky } = this.state  TODO: Put this back in when we can make it look like the mockup.
    // see https://www.pivotaltracker.com/story/show/117576881 & https://www.pivotaltracker.com/story/show/115343939
    // http://static.concord.org/home/emcelroy/report/index5.html
    const { isSticky } = false
    if (isSticky) {
      // the sectionName is not used for now
      return <span>{[investigationName, activityName, `Page: ${pageName}`].join(' › ')} › Question #{question.get('questionNumber')}</span>
    }
    else {
      return <span>Question #{question.get('questionNumber')}</span>
    }
  }

  // TODO: Temporarily removed (see notes in above TODO)
  renderSticky() {
    const { question } = this.props
    const { answersVisible } = this.state
    return (
      <StickyContainer>
        <div className={`question ${question.get('visible') ? '' : 'hidden'}`}>
          <Sticky className="question-header" onStickyStateChange={this.handleStickyStateChange}>
            <SelectionCheckbox selected={question.get('selected')} questionKey={question.get('key')}/>
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

  render() {
    const { question } = this.props
    const { answersVisible } = this.state
    return (
      <div className={`question ${question.get('visible') ? '' : 'hidden'}`}>
        { this.renderQuestionHeader() }
        <a className='answers-toggle' onClick={this.toggleAnswersVisibility}>
          {answersVisible ? 'Hide responses' : 'Show responses'}
        </a>

        <QuestionSummary question={question}/>
        <QuestionDetails question={question}/>
        {answersVisible ? <AnswersTable answers={question.get('answers')}/> : ''}
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
