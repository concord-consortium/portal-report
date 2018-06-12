import React, { PureComponent } from 'react'

export default class OpenResponseAnswer extends PureComponent {
  render () {
    const { answer } = this.props
    return (
      <div>
        {answer.get('answer')}
      </div>
    )
  }
}
