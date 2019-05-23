import React, { PureComponent } from "react";
import MaybeLink from "./maybe-link";

export default class QuestionHeader extends PureComponent {
  get questionName() {
    // Provide question name only for the iframe question type.
    const { question } = this.props;
    if (question.get("type") === "iframe_interactive") {
      return `: ${question.get("name")}`;
    }
    return "";
  }

  render() {
    const { question, url } = this.props;
    return (
      <span className="page-link">
        <MaybeLink url={url}>
          <span>Question #{question.get("questionNumber")}{this.questionName}</span>
        </MaybeLink>
      </span>
    );
  }
}
