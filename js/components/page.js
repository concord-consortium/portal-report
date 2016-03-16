import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'
import Question from '../containers/question'

import '../../css/page.less'

@pureRender
export default class Page extends Component {
  render() {
    const { page, reportFor } = this.props
    return (
      <div className={`page ${page.get('visible') ? '' : 'hidden'}`}>
        <h4>Page: {page.get('name')}</h4>
        <div>
          {page.get('children').map((question, idx) => {
              return <Question key={question.get('key')} question={question} number={idx + 1} reportFor={reportFor}/>
          })}
        </div>
      </div>
    )
  }
}
