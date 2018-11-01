import React, { PureComponent } from 'react'

const UPDATE_INTERVAL = 1000

export default class FeedbackBox extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      value: props.initialFeedback || ''
    }
    this.updateText = this.updateText.bind(this)
  }

  clearUpdateTimer () {
    if (this.updateTimer) {
      clearTimeout(this.updateTimer)
    }
  }

  updateText (e) {
    const value = e.target.value
    this.clearUpdateTimer()
    this.setState({value: value})
    this.updateTimer = setTimeout(() => this.props.onChange(this.state.value), this.props.updateInterval || UPDATE_INTERVAL)
  }

  render () {
    return (
      <textarea
        data-cy='feedbackBox'
        rows='10'
        cols='20'
        value={this.state.value}
        disabled={this.props.disabled}
        onChange={this.updateText} />
    )
  }
}
