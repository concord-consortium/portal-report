import React, { PureComponent } from "react";
import MaybeLink from "./maybe-link";

export default class QuestionHeader extends PureComponent {
  get questionName() {
    // Provide question name only for the iframe question type.
    const { question } = this.props;
    if (question?.type === "iframe_interactive") {
      return `: ${question?.name}`;
    }
    return "";
  }

  render() {
    const { question, url } = this.props;
    return (
      <span className="page-link">
        <MaybeLink url={url}>
          <span>Question #{question?.questionNumber}{this.questionName}</span>
        </MaybeLink>
      </span>
    );
  }
}
