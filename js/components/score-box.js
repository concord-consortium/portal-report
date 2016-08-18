import React, { Component } from 'react'

import pureRender from 'pure-render-decorator'

const UPDATE_INTERVAL = 1000

@pureRender
export default class ScoreBox extends Component {

  constructor(props) {
    super(props)
    this.state = {
      value: props.initialScore || ""
    }
    this.updateText = this.updateText.bind(this)
  }

  clearUpdateTimer() {
    if(this.updateTimer) {
      clearTimeout(this.updateTimer)
    }
  }

  validateValue(v) {
    return parseInt(v) || ""
  }

  updateText(e) {
    const value = e.target.value
    this.clearUpdateTimer()
    this.setState({value: this.validateValue(value)})
    this.updateTimer = setTimeout( ()=> this.props.onChange(this.state.value), this.props.updateInterval || UPDATE_INTERVAL)
  }

  render() {
    return  (
      <div className="score">
        Score
        <input
          disabled={this.props.disabled }
          onChange={this.updateText }
          value={this.state.value}
        />
      </div>
    )
  }
}

