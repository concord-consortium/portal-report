import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'
import OpenResponseAnswer from './open-response-answer'
import MultipleChoiceAnswer from './multiple-choice-answer'
import ImageAnswer from './image-answer'
import IframeAnswer from './iframe-answer'
import NoAnswer from './no-answer'

const AnswerComponent = {
  'Embeddable::OpenResponse': OpenResponseAnswer,
  'Embeddable::MultipleChoice': MultipleChoiceAnswer,
  'Embeddable::ImageQuestion': ImageAnswer,
  'Embeddable::Iframe': IframeAnswer,
  'NoAnswer': NoAnswer
}

@pureRender
export default class Answer extends Component {
  render() {
    const { answer, alwaysOpen } = this.props
    const AComponent = AnswerComponent[answer.get('type')]
    if (!AComponent) {
      return <div>Answer type not supported.</div>
    }
    return <AComponent answer={answer} alwaysOpen={alwaysOpen}/>
  }
}
