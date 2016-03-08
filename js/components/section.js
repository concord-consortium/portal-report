import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'
import Page from './page'

@pureRender
export default class Section extends Component {
  render() {
    const { section } = this.props
    return (
      <div className={`section ${section.visible ? '' : 'hidden'}`}>
        <span className={section.nameHidden ? 'hidden' : ''}>{section.name}</span>
        <div>
          {section.children.map(p => <Page key={p.id} page={p}/>)}
        </div>
      </div>
    )
  }
}
