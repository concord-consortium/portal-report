import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'
import Page from './page'

@pureRender
export default class Section extends Component {
  render() {
    const { section, reportFor } = this.props
    return (
      <div className={`section ${section.get('visible') ? '' : 'hidden'}`}>
        <span className={section.get('nameHidden') ? 'hidden' : ''}>{section.get('name')}</span>
        <div>
          {section.get('children').map(p => <Page key={p.get('id')} page={p} reportFor={reportFor}/>)}
        </div>
      </div>
    )
  }
}
