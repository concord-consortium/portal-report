import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'
import Question from '../components/question'

import '../../css/page.less'

@pureRender
export default class Page extends Component {
  render() {
    const { page, reportFor, investigationName, activityName, sectionName } = this.props
    const pageName = page.get('name')
    return (
      <div className={`page ${page.get('visible') ? '' : 'hidden'}`}>
        <h4>Page: {pageName}</h4>
        <div>
          {page.get('children').map((question) => {
              return <Question key={question.get('key')} question={question} reportFor={reportFor} investigationName={investigationName} activityName={activityName} sectionName={sectionName} pageName={pageName} />
          })}
        </div>
      </div>
    )
  }
}
