import React, { PureComponent } from 'react' // eslint-disable-line

const DEFAULT_VALUE = 0

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
    const defaultValue = this.props.default || DEFAULT_VALUE
    const newValue = parseInt(this.state.value, 10) || defaultValue
    const onChange = this.props.onChange
    const lastValue = this.props.value
    this.setState({value: newValue})
    if ((newValue !== lastValue) && onChange) {
      onChange(newValue)
    }
  }

  render () {
    const { className } = this.props
    const { value } = this.state
    return (
      <input
        className={className}
        value={value}
        onChange={this.updateValue}
        onBlur={this.setValue}
      />
    )
  }
}

export default NumericTextField
