import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'
import Question from '../containers/question'

@pureRender
export default class Page extends Component {
  render() {
    const { page } = this.props
    return (
      <div className={`page ${page.visible ? '' : 'hidden'}`}>
        <h4>Page: {page.name}</h4>
        <div>
          {page.children.map((question, idx) => {
              const id = question.type + question.id
              return <Question key={id} question={question} number={idx + 1}/>
          })}
        </div>
      </div>
    )
  }
}
