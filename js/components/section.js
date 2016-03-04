import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'
import PageContainer from '../containers/page'

@pureRender
export default class Section extends Component {
  render() {
    const { sectionJSON, hidden, nameHidden } = this.props
    return (
      <div className={`section ${hidden ? 'hidden' : ''}`}>
        <span className={nameHidden ? 'hidden' : ''}>{sectionJSON.name}</span>
        <div>
          {sectionJSON.children.map(p => <PageContainer key={p.id} pageJSON={p}/>)}
        </div>
      </div>
    )
  }
}
