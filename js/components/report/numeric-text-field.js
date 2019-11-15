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
    // If the parent component changes the props.value after the component is mounted
    // this change isn't reflected in the UI.
    // I think this use case only happens when the parent component also disables the
    // NumericTextField, so the code below fixes it by ignoring the state.value.
    //
    // However, this doesnt seem like the right way to solve the problem. This component
    // is trying to be an input and output at the same time. And in most cases the parent
    // is actually managing the state. So it might be better to stop using state.value
    // all together.
    //
    // It might not be useful, but this post talks about something of a similiar scenario:
    // https://stackoverflow.com/a/49868300/3195497
    // However the main use case of mixing state and props seems to be when computing an
    // expensive state value. That isn't the case for us.
    const value = disabled ? this.props.value : this.state.value;
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
