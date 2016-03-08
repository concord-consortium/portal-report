import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'

@pureRender
export default class MultipleChoiceAnswer extends Component {
  render() {
    const { answer } = this.props
    return (
      <div>
        {answer.answer.map(a => a.choice).join(', ')}
      </div>
    )
  }
}
