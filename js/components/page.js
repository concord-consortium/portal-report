import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'
import QuestionContainer from '../containers/question'

@pureRender
export default class Page extends Component {
  render() {
    const { pageJSON, hidden } = this.props
    return (
      <div className={`page ${hidden ? 'hidden' : ''}`}>
        <h4>Page: {pageJSON.name}</h4>
        <div>
          {pageJSON.children.map((question, idx) => {
              const id = question.type + question.id
              return <QuestionContainer key={id} questionJSON={question} number={idx + 1}/>
          })}
        </div>
      </div>
    )
  }
}
