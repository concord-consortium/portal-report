import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'
import Answer from './answer'

import '../../css/compare-view.less'

@pureRender
export default class CompareView extends Component {
  render() {
    const { answers } = this.props
    return (
      <div className='compare-view'>
        <div className='answers-container'>
          {answers.map(a =>
            <div className='answer-wrapper' key={a.get('key')}>
              <div><strong>{a.getIn(['student', 'name'])}</strong></div>
              <div className='answer'>
                <Answer answer={a} alwaysOpen={true}/>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }
}
