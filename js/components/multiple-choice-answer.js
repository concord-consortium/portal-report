import React, { PureComponent } from 'react'

export default class MultipleChoiceAnswer extends PureComponent {
  render() {
    const { answer } = this.props
    return (
      <div>
        {answer.get('answer').map(a => a.get('choice')).join(', ')}
      </div>
    )
  }
}
