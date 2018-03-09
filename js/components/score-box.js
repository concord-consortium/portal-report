import React, { PureComponent } from 'react'

export default class ScoreBox extends PureComponent {
  constructor (props) {
    super(props)
    this.updateText = this.updateText.bind(this)
  }

  validateValue (v) {
    return parseInt(v) || 0
  }

  updateText (e) {
    const value = e.target.value
    this.props.onChange(this.validateValue(value))
  }

  render () {
    return (
      <div className='score'>
        Score
        <input
          disabled={this.props.disabled}
          onChange={this.updateText}
          value={this.props.score}
        />
      </div>
    )
  }
}
