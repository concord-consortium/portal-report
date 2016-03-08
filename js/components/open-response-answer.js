import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'

@pureRender
export default class OpenResponseAnswer extends Component {
  render() {
    const { answer } = this.props
    return (
      <div>
        {answer.answer}
      </div>
    )
  }
}
