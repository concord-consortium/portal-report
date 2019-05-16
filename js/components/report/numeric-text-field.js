import React, { PureComponent } from "react"; // eslint-disable-line

// Numeric text fields DEFAULT value is not
// the same thing as MAX_SCORE_DEFAULT.
const DEFAULT_NUMERIC_INPUT_VALUE = 0;
const DEFAULT_NUMERIC_MIN_VALUE = 0;

class NumericTextField extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      showOnlyNeedReview: true,
      showFeedbackPanel: false,
      value: 0,
    };
    this.updateValue = this.updateValue.bind(this);
    this.setValue = this.setValue.bind(this);
  }

  componentDidMount() {
    const {value} = this.props;
    this.setState({value: value});
  }

  updateValue(event) {
    this.setState({value: event.target.value});
  }

  setValue(event) {
    const {min, onChange} = this.props;
    const numericValue = parseInt(this.state.value, 10);
    const lastValue = this.props.value;

    const defaultValue = typeof this.props.default === "undefined"
      ? DEFAULT_NUMERIC_INPUT_VALUE
      : this.props.default;

    const minValue = typeof min === "undefined"
      ? DEFAULT_NUMERIC_MIN_VALUE
      : min;

    let newValue = isNaN(numericValue)
      ? defaultValue
      : numericValue;

    newValue = newValue >= minValue
      ? newValue
      : defaultValue;

    this.setState({value: newValue});
    if ((newValue !== lastValue) && onChange) {
      onChange(newValue);
    }
  }

  render() {
    const { className, disabled } = this.props;
    const { value } = this.state;
    return (
      <input
        className={className}
        value={value}
        onChange={this.updateValue}
        onBlur={this.setValue}
        disabled={disabled}
      />
    );
  }
}

export default NumericTextField;
