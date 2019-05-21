import React, { PureComponent } from "react";
import QuestionForClass from "./question-for-class";
import QuestionForStudent from "./question-for-student";

export default class Question extends PureComponent {
  render() {
    const { question, reportFor, url } = this.props;
    if (reportFor === "class") {
      return <QuestionForClass question={question} url={url} />;
    } else {
      return <QuestionForStudent question={question} student={reportFor} url={url} />;
    }
  }
}
