import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'

@pureRender
export default class OpenResponseAnswer extends Component {
  render() {
    const { answerJSON } = this.props
    return (
      <div>
        {answerJSON.answer}
      </div>
    )
  }
}
