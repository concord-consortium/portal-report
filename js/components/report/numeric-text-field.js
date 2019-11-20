import React, { PureComponent } from "react"; // eslint-disable-line

const DEFAULT_NUMERIC_MIN_VALUE = 0;

// This is an uncontrolled component
// it keeps a draftValue in its state as the user is typing
// when onBlur happens the draftValue is converted to a number
// and props.onChange is called with the new value
class NumericTextField extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      showOnlyNeedReview: true,
      showFeedbackPanel: false,
      draftValue: props.initialValue || 0,
      lastValue: props.initialValue || 0,
    };
    this.updateValue = this.updateValue.bind(this);
    this.setValue = this.setValue.bind(this);
  }

  updateValue(event) {
    this.setState({draftValue: event.target.value});
  }

  setValue(event) {
    const {min, onChange} = this.props;
    const numericValue = parseInt(this.state.draftValue, 10);
    const lastValue = this.state.lastValue;

    const minValue = typeof min === "undefined"
      ? DEFAULT_NUMERIC_MIN_VALUE
      : min;

    let newValue = isNaN(numericValue)
      ? lastValue
      : numericValue;

    newValue = newValue >= minValue
      ? newValue
      : lastValue;

    this.setState({value: newValue});
    if ((newValue !== lastValue) && onChange) {
      this.setState({lastValue: newValue});
      onChange(newValue);
    }
  }

  render() {
    const { className, disabled } = this.props;
    const { draftValue } = this.state;

    return (
      <input
        className={className}
        value={draftValue}
        onChange={this.updateValue}
        onBlur={this.setValue}
        disabled={disabled}
      />
    );
  }
}

export default NumericTextField;
