import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'
import Page from './page'

import '../../css/section.less'

@pureRender
export default class Section extends Component {
  render() {
    const { section, reportFor, investigationName, activityName } = this.props
    const sectionName = section.get('name')
    return (
      <div className={`section ${section.get('visible') ? '' : 'hidden'}`}>
        <span className={section.get('nameHidden') ? 'hidden' : ''}>{sectionName}</span>
        <div>
          {section.get('children').map(p => <Page key={p.get('id')} page={p} reportFor={reportFor} investigationName={investigationName} activityName={activityName} sectionName={sectionName} />)}
        </div>
      </div>
    )
  }
}
