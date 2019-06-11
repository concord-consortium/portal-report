import React, { PureComponent } from "react";
import { connect } from "react-redux";
import { setAnswerSelectedForCompare } from "../../actions/index";

export class CompareAnswerCheckbox extends PureComponent {
  render() {
    const { answer, onChange } = this.props;
    return (
      <input type="checkbox" checked={answer.get("selectedForCompare")}
        onChange={(e) => onChange(answer.get("id"), e.target.checked)} />
    );
  }
}

export class CompareAnswerRmLink extends PureComponent {
  render() {
    const { answer, onChange, children } = this.props;
    return (
      <a onClick={(e) => onChange(answer.get("id"), false)}>{children}</a>
    );
  }
}

// AddLink would be simple too, but there is no use case for it yet.

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onChange: (key, value) => dispatch(setAnswerSelectedForCompare(key, value)),
  };
};

export const CompareAnswerCheckboxContainer = connect(null, mapDispatchToProps)(CompareAnswerCheckbox);
export const CompareAnswerRmLinkContainer = connect(null, mapDispatchToProps)(CompareAnswerRmLink);
