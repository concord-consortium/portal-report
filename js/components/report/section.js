import React, { PureComponent } from 'react'

import Page from './page'
import Sticky from 'react-stickynode'
import '../../../css/report/section.less'

export default class Section extends PureComponent {
  render () {
    const { section, reportFor } = this.props
    const sectionName = section.get('name')
    return (
      <div className={`section ${section.get('visible') ? '' : 'hidden'}`}>
        <Sticky top={60} className={section.get('nameHidden') ? 'hidden' : ''}>
          {sectionName}
        </Sticky>
        <div>
          {section.get('children').map(p => <Page key={p.get('id')} page={p} reportFor={reportFor} />)}
        </div>
      </div>
    )
  }
}
