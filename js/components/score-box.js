import React, { PureComponent } from 'react'

const UPDATE_INTERVAL = 1000

export default class ScoreBox extends PureComponent {

  constructor(props) {
    super(props)
    this.state = {
      value: props.initialScore || 0
    }
    this.updateText = this.updateText.bind(this)
  }

  setValue(props) {
    const { initialScore } = props;
    this.setState({
      value: initialScore || 0
    })
  }

  componentDidMount() {
    this.setValue(this.props)
  }

  componentWillUpdate(nextProps) {
    this.setValue(nextProps)
  }

  clearUpdateTimer() {
    if(this.updateTimer) {
      clearTimeout(this.updateTimer)
    }
  }

  validateValue(v) {
    return parseInt(v) || 0
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

