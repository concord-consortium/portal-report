import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'
import Question from '../containers/question'

@pureRender
export default class Page extends Component {
  render() {
    const { page } = this.props
    return (
      <div className={`page ${page.get('visible') ? '' : 'hidden'}`}>
        <h4>Page: {page.get('name')}</h4>
        <div>
          {page.get('children').map((question, idx) => {
              return <Question key={question.get('key')} question={question} number={idx + 1}/>
          })}
        </div>
      </div>
    )
  }
}
