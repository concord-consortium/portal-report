import React, { PureComponent } from 'react' // eslint-disable-line

// Numeric text fields DEFAULT value is not
// the same thing as MAX_SCORE_DEFAULT.
const DEFAULT_NUMERIC_INPUT_VALUE = 0

class NumericTextField extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      showOnlyNeedReview: true,
      showFeedbackPanel: false,
      value: 0
    }
    this.updateValue = this.updateValue.bind(this)
    this.setValue = this.setValue.bind(this)
  }

  componentDidMount () {
    const {value} = this.props
    this.setState({value: value})
  }

  updateValue (event) {
    this.setState({value: event.target.value})
  }

  setValue (event) {
    const defaultValue = this.props.default || DEFAULT_NUMERIC_INPUT_VALUE
    const newValue = parseInt(this.state.value, 10) || defaultValue
    const onChange = this.props.onChange
    const lastValue = this.props.value
    this.setState({value: newValue})
    if ((newValue !== lastValue) && onChange) {
      onChange(newValue)
    }
  }

  render () {
    const { className,disabled } = this.props
    const { value } = this.state
    return (
      <input
        className={className}
        value={value}
        onChange={this.updateValue}
        onBlur={this.setValue}
        disabled={disabled}
      />
    )
  }
}

export default NumericTextField
