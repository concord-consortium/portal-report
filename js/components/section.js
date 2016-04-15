import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'
import Page from './page'
import Sticky from 'react-stickynode';
import '../../css/section.less'

export default class Section extends Component {
  render() {
    const { section, reportFor, investigationName, activityName } = this.props
    const sectionName = section.get('name')
    return (
      <div className={`section ${section.get('visible') ? '' : 'hidden'}`}>
        <Sticky top={60} className={section.get('nameHidden') ? 'hidden' : ''}>
          {sectionName}
        </Sticky>
        <div>
          {section.get('children').map(p => <Page key={p.get('id')} page={p} reportFor={reportFor} investigationName={investigationName} activityName={activityName} sectionName={sectionName} />)}
        </div>
      </div>
    )
  }
}
